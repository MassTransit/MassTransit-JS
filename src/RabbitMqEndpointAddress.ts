export class RabbitMqHostAddress {
    host: string
    port?: number
    virtualHost: string
    heartbeat?: number
    protocol: string

    constructor(settings: HostSettings) {
        this.host = settings.host
        this.virtualHost = settings.virtualHost
        this.port = settings.port

        if (settings.ssl) {
            this.protocol = "amqps:"
            if (!this.port)
                this.port = 5671
        } else
            this.protocol = "amqp:"

        this.heartbeat = settings.heartbeat ?? 60
    }

    toUrl(): URL {
        let url = new URL(`${this.protocol}//${this.host}`)

        if (this.port && this.port !== 5672)
            url.port = this.port.toString()

        url.pathname = this.virtualHost === "/" ? "/" : `/${encodeURIComponent(this.virtualHost)}`

        if (this.heartbeat)
            url.searchParams.append("heartbeat", this.heartbeat.toString())

        return url
    }

    toString(): string {
        return this.toUrl().toString()
    }

    static parseVirtualHost(url: URL): string {

        let path: string = url.pathname
        if (path === null || path.match(/^ *$/))
            return "/"

        if (path === "/")
            return "/"

        let split = path.lastIndexOf("/")
        if (split > 0)
            return decodeURIComponent(path.substr(1, split - 1))

        return decodeURIComponent(path.substr(1))
    }

    static parse(address: string): RabbitMqHostAddress {

        let url = new URL(address)
        if (!url)
            throw new Error(`Invalid host address: ${address}`)

        let ssl: boolean
        let port: number | undefined
        switch (url.protocol) {
            case "rabbitmq:":
            case "amqp:":
                ssl = false
                break

            case "rabbitmqs:":
            case "amqps:":
                ssl = true
                port = 5671
                break

            default:
                throw new Error(`Invalid protocol: ${url.protocol}`)
        }

        let host = url.host
        if (url.port && url.port !== "")
            port = +url.port

        if (port === 5671)
            ssl = true

        let virtualHost = RabbitMqHostAddress.parseVirtualHost(url)

        let heartbeat = 60

        url.searchParams.forEach((value, key) => {
            switch (key.toLowerCase()) {
                case "heartbeat":
                    heartbeat = +value
                    break
                case "ttl":
                    break
                case "prefetch":
                    break
                default:
                    break
            }
        })

        return new RabbitMqHostAddress({host: host, port: port, virtualHost: virtualHost, heartbeat: heartbeat, ssl: ssl})
    }
}

export interface HostSettings {
    host: string
    virtualHost: string
    port?: number
    ssl?: boolean
    heartbeat?: number
}

export class RabbitMqEndpointAddress {
    hostAddress: RabbitMqHostAddress
    name: string
    durable: boolean
    autoDelete: boolean
    exchangeType?: string
    bindToQueue: boolean
    queueName?: string

    constructor(hostAddress: RabbitMqHostAddress, settings: EndpointSettings) {
        this.hostAddress = hostAddress

        this.name = settings.name
        this.durable = settings.durable ?? true
        this.autoDelete = settings.autoDelete ?? false
        this.exchangeType = settings.exchangeType ?? "fanout"
        this.bindToQueue = settings.bindToQueue ?? false
        this.queueName = settings.queueName
    }

    toUrl(): URL {
        let url = this.hostAddress.toUrl()

        url.pathname = url.pathname.endsWith("/") ? url.pathname + this.name : url.pathname + "/" + this.name
        url.search = ""

        if (!this.durable && this.autoDelete)
            url.searchParams.append("temporary", "true")
        else if (this.autoDelete)
            url.searchParams.append("autodelete", "true")
        else if (!this.durable)
            url.searchParams.append("durable", "false")

        if (this.bindToQueue)
            url.searchParams.append("bind", "true")
        if (this.queueName)
            url.searchParams.append("queue", encodeURIComponent(this.queueName))

        return url
    }

    toString(): string {
        return this.toUrl().toString()
    }

    static parseHostPathAndEntityName(url: URL): [string, string] {

        let path: string = url.pathname
        if (path === null || path.match(/^ *$/))
            return ["/", ""]

        if (path === "/")
            return ["/", ""]

        let split = path.lastIndexOf("/")
        if (split > 0)
            return [decodeURIComponent(path.substr(1, split - 1)), path.substr(split + 1)]

        return ["/", decodeURIComponent(path.substr(1))]
    }

    static parse(hostAddress: RabbitMqHostAddress, address: string): RabbitMqEndpointAddress {

        let url = new URL(address)
        if (!url)
            throw new Error(`Invalid host address: ${address}`)

        let name: string
        let bindToQueue: boolean = false
        switch (url.protocol) {
            case "rabbitmq:":
            case "amqp:":
            case "rabbitmqs:":
            case "amqps:":
                let [_, entityName] = RabbitMqEndpointAddress.parseHostPathAndEntityName(url)
                name = entityName
                break

            case "queue":
                name = url.pathname
                bindToQueue = true
                break

            case "exchange":
                name = url.pathname
                break

            default:
                throw new Error(`Invalid protocol: ${url.protocol}`)
        }

        let settings: EndpointSettings = {name: name}

        url.searchParams.forEach((value, key) => {
            switch (key.toLowerCase()) {
                case "temporary":
                    settings.autoDelete = value === "true"
                    settings.durable = value !== "true"
                    break
                case "type":
                    settings.exchangeType = value
                    break
                case "bind":
                    settings.bindToQueue = true
                    break
                case "queue":
                    settings.queueName = decodeURIComponent(value)
                    break
                case "durable":
                    settings.autoDelete = value === "true"
                    break
                case "autodelete":
                    settings.autoDelete = value === "true"
                    break
                default:
                    break
            }
        })

        return new RabbitMqEndpointAddress(hostAddress, settings)
    }
}

export interface EndpointSettings {
    durable?: boolean
    autoDelete?: boolean
    exchangeType?: string
    name: string
    bindToQueue?: boolean
    queueName?: string
}

