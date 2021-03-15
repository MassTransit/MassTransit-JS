import {MessageContext} from "./messageContext"
import {Host} from "./host"
import {MessageMap} from "./serialization"
import {SendContext} from "./sendContext"
import {ReceiveEndpoint} from "./receiveEndpoint"

export interface ConsumeContext<T extends object> extends MessageContext {
    message: T;

    respond<T extends MessageMap>(message: T, cb?: (send: SendContext<T>) => void): Promise<void>

}

export class ConsumeContext<T extends object> implements ConsumeContext<T> {
    messageId?: string
    requestId?: string
    correlationId?: string
    conversationId?: string
    initiatorId?: string
    expirationTime?: string
    sourceAddress?: string
    destinationAddress?: string
    responseAddress?: string
    faultAddress?: string
    sentTime?: string
    messageType?: Array<string>
    headers?: object
    host?: Host
    message!: T

    receiveEndpoint!: ReceiveEndpoint

    async respond<T extends MessageMap>(message: T, cb?: (send: SendContext<T>) => void): Promise<void> {
        if (this.responseAddress) {
            let address = new URL(this.responseAddress)
            let exchangeName = address.pathname
            if (exchangeName.startsWith("/"))
                exchangeName = exchangeName.substr(1)
            let slashIndex = exchangeName.lastIndexOf("/")
            if (slashIndex > 0)
                exchangeName = exchangeName.substr(slashIndex + 1)

            let sendEndpoint = this.receiveEndpoint.sendEndpoint({exchange: exchangeName})

            await sendEndpoint.send<T>(message, send => {
                send.requestId = this.requestId
                if (cb) cb(send)
            })
        }

    }
}


