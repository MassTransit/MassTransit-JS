import { ConsumeMessage, Options } from "amqplib";
import { Bus } from "./bus";
import { ConsumeContext } from "./consumeContext";
import { MessageMap } from "./serialization";
import { SendEndpoint } from "./sendEndpoint";
import { SendEndpointArguments, Transport } from "./transport";
/**
 * Configure the receive endpoint, including any message handlers
 */
export interface ReceiveEndpointConfigurator {
    queueName: string;
    options: ReceiveEndpointOptions;
    handle<T extends MessageMap>(messageType: string, listener: (message: ConsumeContext<T>) => void): this;
}
export interface ReceiveEndpoint {
    sendEndpoint(args: SendEndpointArguments): SendEndpoint;
}
export declare class ReceiveEndpoint extends Transport implements ReceiveEndpointConfigurator, ReceiveEndpoint {
    queueName: string;
    options: ReceiveEndpointOptions;
    private readonly _messageTypes;
    address: string;
    constructor(bus: Bus, queueName: string, options?: ReceiveEndpointOptions);
    handle<T extends Record<string, any>>(messageType: string, listener: (message: ConsumeContext<T>) => void): this;
    emitMessage(msg: ConsumeMessage): void;
    private onChannel;
    private configureTopology;
}
export interface ReceiveEndpointOptions extends Options.AssertQueue, Options.AssertExchange, Options.Consume {
    prefetchCount: number;
    globalPrefetch: boolean;
    exclusive?: boolean;
    durable?: boolean;
    autoDelete?: boolean;
    arguments?: any;
    messageTtl?: number;
    expires?: number;
    deadLetterExchange?: string;
    deadLetterRoutingKey?: string;
    maxLength?: number;
    maxPriority?: number;
}
export declare const defaultReceiveEndpointOptions: ReceiveEndpointOptions;
