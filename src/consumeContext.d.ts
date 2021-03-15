import { MessageContext } from "./messageContext";
import { Host } from "./host";
export interface ConsumeContext<T extends object> extends MessageContext {
    message: T;
}
export declare class ConsumeContext<T extends object> implements ConsumeContext<T> {
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
}
