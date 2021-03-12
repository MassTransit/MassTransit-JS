import {ConsumeContext} from "./consumeContext"
import EventEmitter from "events"
import {serialize, deserialize} from "class-transformer"
import {SendContext} from "./sendContext"

export type MessageMap = Record<string, any>
export type MessageHandler<T extends MessageMap> = (message: ConsumeContext<T>) => void

export interface MessageDeserializer {
    dispatch(json: string): void
}

export interface MessageTypeDeserializer<T extends MessageMap> extends MessageDeserializer {

    on(handler: MessageHandler<T>): void

    off(handler: MessageHandler<T>): void
}

export class MessageTypeDeserializer<T extends MessageMap> implements MessageTypeDeserializer<T> {
    private _emitter = new EventEmitter()

    on(handler: MessageHandler<T>): void {
        this._emitter.on("message", handler)
    }

    off(handler: MessageHandler<T>): void {
        this._emitter.off("message", handler)
    }

    dispatch(json: string): void {

        let context = deserialize(ConsumeContext, json)

        this._emitter.emit("message", context)
    }
}

export interface MessageSerializer {
    serialize<T extends MessageMap>(send: SendContext<T>): Buffer
}

export class JsonMessageSerializer implements MessageSerializer {

    serialize<T extends MessageMap>(send: SendContext<T>) {

        return Buffer.from(serialize(send))
    }

}

