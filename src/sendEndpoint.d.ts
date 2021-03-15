import { SendContext } from "./sendContext";
import { Transport } from "./transport";
import { MessageMap } from "./serialization";
export interface SendEndpoint {
    send<T extends MessageMap>(message: T, cb?: (send: SendContext<T>) => void): Promise<void>;
}
export declare class SendEndpoint implements SendEndpoint {
    private transport;
    private readonly exchange;
    private readonly routingKey;
    constructor(transport: Transport, exchange?: string, routingKey?: string);
}
