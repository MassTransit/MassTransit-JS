import {SendContext} from "./sendContext"
import {Transport} from "./transport"
import {MessageMap} from "./serialization"

export interface SendEndpoint {
    send<T extends MessageMap>(message: T, cb?: (send: SendContext<T>) => void): Promise<void>
}

export class SendEndpoint implements SendEndpoint {
    private transport: Transport
    private readonly exchange: string
    private readonly routingKey: string

    constructor(transport: Transport, exchange?: string, routingKey?: string) {
        this.transport = transport
        this.exchange = exchange ?? ""
        this.routingKey = routingKey ?? ""
    }

    async send<T extends object>(message: T, cb?: (send: SendContext<T>) => void) {
        let send = new SendContext<T>(message)
        if (cb) {
            cb(send)
        }

        await this.transport.send(this.exchange, this.routingKey, send)
    }
}


