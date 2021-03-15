import { MessageContext } from "./messageContext";
import { Host } from "./host";
export interface SendContext<T extends object> extends MessageContext {
    message: T;
}
export declare class SendContext<T extends object> implements SendContext<T> {
    messageId?: string;
    requestId?: string;
    correlationId?: string;
    conversationId?: string;
    initiatorId?: string;
    expirationTime?: string;
    sourceAddress?: string;
    destinationAddress?: string;
    responseAddress?: string;
    faultAddress?: string;
    sentTime?: string;
    messageType?: Array<string>;
    headers?: object;
    host?: Host;
    message: T;
    constructor(message: T);
}
