/// <reference types="node" />
import { ConsumeContext } from "./consumeContext";
import { SendContext } from "./sendContext";
import { ReceiveEndpoint } from "./receiveEndpoint";
export declare type MessageMap = Record<string, any>;
export declare type MessageHandler<T extends MessageMap> = (message: ConsumeContext<T>) => void;
export interface MessageDeserializer {
    dispatch(json: string): void;
}
export interface MessageTypeDeserializer<T extends MessageMap> extends MessageDeserializer {
    on(handler: MessageHandler<T>): void;
    off(handler: MessageHandler<T>): void;
}
export declare class MessageTypeDeserializer<T extends MessageMap> implements MessageTypeDeserializer<T> {
    private readonly receiveEndpoint;
    constructor(receiveEndpoint: ReceiveEndpoint);
    private _emitter;
    dispatch(json: string): void;
}
export interface MessageSerializer {
    serialize<T extends MessageMap>(send: SendContext<T>): Buffer;
}
export declare class JsonMessageSerializer implements MessageSerializer {
    serialize<T extends MessageMap>(send: SendContext<T>): Buffer;
}
