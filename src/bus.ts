import EventEmitter from "events"
import {connect, Connection} from "amqplib"
import {defaultReceiveEndpointOptions, ReceiveEndpoint, ReceiveEndpointConfigurator, ReceiveEndpointOptions} from "./receiveEndpoint"
import {SendEndpoint} from "./sendEndpoint"
import {delay} from "./util"
import {SendEndpointArguments} from "./transport"
import {ConnectionContext} from "./connectionContext"
import {Guid} from "guid-typescript"

export interface Bus {
    brokerUrl: string

    on(event: "connect", listener: (context: ConnectionContext) => void): this

    on(event: "disconnect", listener: (brokerUrl: string) => void): this

    on(event: "error", listener: (err: any) => void): this

    receiveEndpoint(queueName: string, config: (endpoint: ReceiveEndpointConfigurator) => void, options?: ReceiveEndpointOptions): void

    sendEndpoint(args: SendEndpointArguments): SendEndpoint

    stop(): Promise<void>

    restart(): Promise<void>
}

class MassTransitBus extends EventEmitter implements Bus {
    brokerUrl: string
    stopped: boolean
    private connection?: Promise<Connection>
    private _cancelConnect: any
    private readonly _retryIntervalInSeconds: number
    private busEndpoint: ReceiveEndpoint

    constructor(brokerUrl: string) {
        super()

        this.brokerUrl = brokerUrl

        this.setMaxListeners(0)

        this.stopped = false
        this._retryIntervalInSeconds = 3

        this.busEndpoint = this.receiveEndpoint(`bus-${Guid.create().toString()}`, config => {
            config.options.durable = false
            config.options.autoDelete = true
            config.options.arguments = {"x-expires": 60000}
        })

        this.connect()
            .catch(() => (err: { message: any; stack: string }) => setImmediate(() => {
                throw new Error(`Unexpected code block reached: ${err.message}\n` + err.stack)
            }))
    }

    async stop(): Promise<void> {
        if (this.stopped) return Promise.resolve()

        this.stopped = true

        if (this._cancelConnect) {
            this._cancelConnect()
            this._cancelConnect = null
        }

        try {

            let connection = await this.connection
            if (connection)
                await connection.close()

            console.log("Bus stopped", this.brokerUrl)
        }
        catch (e) {
            console.error("failed to close bus", e.message)
        }
    }

    async restart(): Promise<void> {
        if (!this.stopped)
            await this.stop()

        this.connect()
            .catch(() => (err: { message: any; stack: string }) => setImmediate(() => {
                throw new Error(`Unexpected code block reached: ${err.message}\n` + err.stack)
            }))

        this.stopped = false
    }

    async connect() {
        const _this = this

        console.log("Connecting", this.brokerUrl)

        try {
            this.connection = connect(this.brokerUrl + "?heartbeat=60")

            let connection = await this.connection

            connection.on("error", err => {
                if (err.message !== "Connection closing") {
                    console.error("Connection error", err.message)
                    _this.emit("error", err)
                }
            })
            connection.on("close", () => {
                this.emit("disconnect", this.brokerUrl)
                this.scheduleReconnect()
            })

            console.log("Connected", this.brokerUrl)

            this.emit("connect", {brokerUrl: this.brokerUrl, connection: connection})
        }
        catch (e) {
            console.error("Connect failed", e.message)

            this.scheduleReconnect()
        }
    }

    private scheduleReconnect() {
        if (this.stopped) return

        let handle = delay(this._retryIntervalInSeconds * 1000)
        this._cancelConnect = handle.cancel

        handle.promise()
            .then(() => this.connect())
            .catch(() => (err: { message: any; stack: string }) => setImmediate(() => {
                throw new Error(`Unexpected code block reached: ${err.message}\n` + err.stack)
            }))
    }

    sendEndpoint(args: SendEndpointArguments): SendEndpoint {
        return this.busEndpoint.sendEndpoint(args)
    }

    /**
     * Connects a receive endpoint to the bus
     *
     * @remarks
     * Once connected, the receive endpoint will remain connected until disconnected
     *
     * @param queueName - The input queue name
     * @param cb - The configuration callback, used to add message handlers, etc.
     * @param options - Options for the receive endpoint, such as queue/exchange properties, etc.
     * @returns Nothing yet, but should return the receive endpoint so that it can be stopped
     *
     */
    receiveEndpoint(queueName: string, cb?: (cfg: ReceiveEndpointConfigurator) => void, options: ReceiveEndpointOptions = defaultReceiveEndpointOptions): ReceiveEndpoint {

        let endpoint = new ReceiveEndpoint(this, queueName, {...defaultReceiveEndpointOptions, ...options})

        if (cb) cb(endpoint)

        this.connection?.then(connection => endpoint.onConnect({brokerUrl: this.brokerUrl, connection: connection}))

        return endpoint
    }
}

interface BusOptions {
    host?: string
    port?: number
    virtualHost?: string
}

const defaults: BusOptions = {
    host: "localhost",
}

export default function masstransit(options: BusOptions = defaults): Bus {
    let url = new URL("amqp://localhost/")

    let busOptions = {...defaults, ...options}

    if (process.env.RABBITMQ_HOST && process.env.RABBITMQ_HOST.length > 0)
        url.host = process.env.RABBITMQ_HOST

    if (busOptions.host && busOptions.host.trim().length > 0)
        url.host = busOptions.host
    if (busOptions.port && busOptions.port > 0)
        url.port = busOptions.port.toString()
    if (busOptions.virtualHost && busOptions.virtualHost.length > 0)
        url.pathname = busOptions.virtualHost.startsWith("/") ? busOptions.virtualHost : "/" + busOptions.virtualHost

    let brokerUrl = url.toString()

    let bus = new MassTransitBus(brokerUrl)

    process.on("SIGINT", async () => {
        await bus.stop()
    })

    return bus
}