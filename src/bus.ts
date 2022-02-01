import EventEmitter from 'events';
import {connect, Connection} from 'amqplib';
import {defaultReceiveEndpointOptions, ReceiveEndpoint, ReceiveEndpointConfigurator, ReceiveEndpointOptions} from './receiveEndpoint';
import {SendEndpoint} from './sendEndpoint';
import {delay} from './util';
import {SendEndpointArguments} from './transport';
import {ConnectionContext} from './connectionContext';
import {Guid} from 'guid-typescript';
import {MessageMap} from './serialization';
import {RequestClient} from './requestClient';
import {MessageType} from './messageType';
import {HostSettings, RabbitMqHostAddress} from './RabbitMqEndpointAddress';
import {AsyncReceiveEndpoint, AsyncReceiveEndpointConfigurator} from './AsyncReceiveEndpoint';

export interface Bus {
    hostAddress: RabbitMqHostAddress

    on(event: 'connect', listener: (context: ConnectionContext) => void): this

    on(event: 'disconnect', listener: (brokerUrl: string) => void): this

    on(event: 'error', listener: (err: any) => void): this

    receiveEndpoint(queueName: string, config: (endpoint: ReceiveEndpointConfigurator) => void, options?: ReceiveEndpointOptions): void
    asyncReceiveEndpoint(queueName: string, config: (endpoint: AsyncReceiveEndpointConfigurator) => void, options?: ReceiveEndpointOptions): void

    sendEndpoint(args: SendEndpointArguments): SendEndpoint

    requestClient<TRequest extends MessageMap, TResponse extends MessageMap>(args: RequestClientArguments): RequestClient<TRequest, TResponse>

    stop(): Promise<void>

    restart(): Promise<void>
}

class MassTransitBus extends EventEmitter implements Bus {
    hostAddress: RabbitMqHostAddress;
    connectionName?: string;

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

        let endpoint = new ReceiveEndpoint(this, queueName, cb, {...defaultReceiveEndpointOptions, ...options});

        this.connection?.then(connection => endpoint.onConnect({hostAddress: this.hostAddress, connection: connection}));

        return endpoint;
    }

    /**
     * Connects a receive endpoint to the bus
     * This endpoint waits for a promise to resolve before acknowledging received messages.
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
    asyncReceiveEndpoint(queueName: string, cb?: (cfg: AsyncReceiveEndpointConfigurator) => void, options: ReceiveEndpointOptions = defaultReceiveEndpointOptions): AsyncReceiveEndpoint {

        let endpoint = new AsyncReceiveEndpoint(this, queueName, cb, {...defaultReceiveEndpointOptions, ...options});

        this.connection?.then(connection => endpoint.onConnect({hostAddress: this.hostAddress, connection: connection}));

        return endpoint;
    }

    sendEndpoint(args: SendEndpointArguments): SendEndpoint {
        return this.busEndpoint.sendEndpoint(args);
    }

    requestClient<TRequest extends MessageMap, TResponse extends MessageMap>(args: RequestClientArguments): RequestClient<TRequest, TResponse> {

        let sendEndpoint = this.busEndpoint.sendEndpoint(args);

        return new RequestClient<TRequest, TResponse>(this.busEndpoint, sendEndpoint, args.requestType, args.responseType);
    }

    async stop(): Promise<void> {
        if (this.stopped) return Promise.resolve();

        this.stopped = true;

        if (this._cancelConnect) {
            this._cancelConnect();
            this._cancelConnect = null;
        }

        try {

            let connection = await this.connection;
            if (connection)
                await connection.close();

            console.log('Bus stopped', this.hostAddress.toString());
        }
        catch (e: any) {
            console.error('failed to close bus', e.message);
        }
    }

    async restart(): Promise<void> {
        if (!this.stopped)
            await this.stop();

        this.connect()
            .catch(() => (err: { message: any; stack: string }) => setImmediate(() => {
                throw new Error(`Unexpected code block reached: ${err.message}\n` + err.stack);
            }));

        this.stopped = false;
    }

    private stopped: boolean;
    private connection?: Promise<Connection>;
    private _cancelConnect: any;
    private readonly _retryIntervalInSeconds: number;
    private readonly busEndpoint: ReceiveEndpoint;

    constructor(hostAddress: RabbitMqHostAddress, connectionName?: string) {
        super();

        this.hostAddress = hostAddress;
        this.connectionName = connectionName;

        this.setMaxListeners(0);

        this.stopped = false;
        this._retryIntervalInSeconds = 3;

        this.busEndpoint = this.receiveEndpoint(`bus-${Guid.create().toString()}`, config => {
            config.options.durable = false;
            config.options.autoDelete = true;
            config.options.arguments = {'x-expires': 60000};
        });

        this.connect()
            .catch(() => (err: { message: any; stack: string }) => setImmediate(() => {
                throw new Error(`Unexpected code block reached: ${err.message}\n` + err.stack);
            }));
    }

    async connect() {
        const _this = this;

        console.log('Connecting', this.hostAddress.toString());

        try {
            this.connection = connect(this.hostAddress + '?heartbeat=60', {clientProperties: {connection_name: this.connectionName}});

            let connection = await this.connection;

            connection.on('error', err => {
                if (err.message !== 'Connection closing') {
                    console.error('Connection error', err.message);
                    _this.emit('error', err);
                }
            });
            connection.on('close', () => {
                this.emit('disconnect', this.hostAddress);
                this.scheduleReconnect();
            });

            console.log('Connected', this.hostAddress.toString());

            this.emit('connect', {hostAddress: this.hostAddress, connection: connection});
        }
        catch (e: any) {
            console.error('Connect failed', e.message);

            this.scheduleReconnect();
        }
    }

    private scheduleReconnect() {
        if (this.stopped) return;

        let handle = delay(this._retryIntervalInSeconds * 1000);
        this._cancelConnect = handle.cancel;

        handle.promise()
            .then(() => this.connect())
            .catch(() => (err: { message: any; stack: string }) => setImmediate(() => {
                throw new Error(`Unexpected code block reached: ${err.message}\n` + err.stack);
            }));
    }
}

export interface RequestClientArguments extends SendEndpointArguments {
    requestType: MessageType
    responseType: MessageType
}

interface BusOptions extends HostSettings {
    connectionName?: string
}

const defaults: BusOptions = {
    host: (process.env.RABBITMQ_HOST && process.env.RABBITMQ_HOST.length > 0) ? process.env.RABBITMQ_HOST : 'localhost',
    virtualHost: (process.env.RABBITMQ_VHOST && process.env.RABBITMQ_VHOST.length > 0) ? process.env.RABBITMQ_VHOST : '/',
};

export default function masstransit(options: BusOptions = defaults): Bus {
    let settings: HostSettings = {...defaults, ...options};

    const hostAddress = new RabbitMqHostAddress(settings);

    let bus = new MassTransitBus(hostAddress, options.connectionName);

    process.on('SIGINT', async () => {
        await bus.stop();
    });

    return bus;
}
