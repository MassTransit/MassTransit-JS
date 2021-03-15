import { MessageMap } from "./serialization";
import { ReceiveEndpoint } from "./receiveEndpoint";
import { SendEndpoint } from "./sendEndpoint";
import { ConsumeContext } from "./consumeContext";
export interface RequestClient<TRequest extends MessageMap, TResponse extends MessageMap> {
    getResponse(request: TRequest): Promise<ConsumeContext<TResponse>>;
}
declare class PendingRequest<TResponse extends MessageMap> {
    requestId: string;
    resolve: (value: ConsumeContext<TResponse> | PromiseLike<ConsumeContext<TResponse>>) => void;
    reject: (reason?: any) => void;
    constructor(requestId: string, resolve: (value: ConsumeContext<TResponse> | PromiseLike<ConsumeContext<TResponse>>) => void, reject: (reason?: any) => void);
}
export declare type RequestMap<TResponse extends MessageMap> = Record<string, PendingRequest<TResponse>>;
export declare class RequestClient<TRequest extends MessageMap, TResponse extends MessageMap> implements RequestClient<TRequest, TResponse> {
    private readonly pendingRequests;
    private receiveEndpoint;
    private sendEndpoint;
    private readonly requestType;
    private responseType;
    constructor(receiveEndpoint: ReceiveEndpoint, sendEndpoint: SendEndpoint, requestType: string, responseType: string);
    private onResponse;
}
export {};
