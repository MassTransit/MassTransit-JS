import { ReceiveEndpointConfigurator, ReceiveEndpointOptions } from "./receiveEndpoint";
import { SendEndpoint } from "./sendEndpoint";
import { SendEndpointArguments } from "./transport";
import { ConnectionContext } from "./connectionContext";
import { MessageMap } from "./serialization";
import { RequestClient } from "./requestClient";
export interface Bus {
    brokerUrl: string;
    on(event: "connect", listener: (context: ConnectionContext) => void): this;
    on(event: "disconnect", listener: (brokerUrl: string) => void): this;
    on(event: "error", listener: (err: any) => void): this;
    receiveEndpoint(queueName: string, config: (endpoint: ReceiveEndpointConfigurator) => void, options?: ReceiveEndpointOptions): void;
    sendEndpoint(args: SendEndpointArguments): SendEndpoint;
    requestClient<TRequest extends MessageMap, TResponse extends MessageMap>(args: SendEndpointArguments, requestType: string, responseType: string): RequestClient<TRequest, TResponse>;
    stop(): Promise<void>;
    restart(): Promise<void>;
}
interface BusOptions {
    host?: string;
    port?: number;
    virtualHost?: string;
}
export default function masstransit(options?: BusOptions): Bus;
export {};
