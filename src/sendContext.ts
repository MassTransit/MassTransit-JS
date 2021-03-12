import {MessageContext} from "./messageContext"
import {Guid} from "guid-typescript"
import {Host, host} from "./host"
import {MessageType} from "./messageType"

export interface SendContext<T extends object> extends MessageContext {
    message: T
}

export class SendContext<T extends object> implements SendContext<T> {
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
    message: T

    constructor(message: T) {
        this.message = message

        this.messageId = Guid.create().toString()
        this.host = host()
    }

    setMessageType(name: string, ns: string) {
        this.messageType = new MessageType(name, ns).toMessageType()

    }
}
