import { MessageMap } from "./serialization";
import { ReceiveEndpoint } from "./receiveEndpoint";
import { SendEndpoint } from "./sendEndpoint";
import { ConsumeContext } from "./consumeContext";
import { MessageType } from "./messageType";
export interface RequestClient<TRequest extends MessageMap, TResponse extends MessageMap> {
    getResponse(request: TRequest): Promise<ConsumeContext<TResponse>>;
}
export declare class RequestClient<TRequest extends MessageMap, TResponse extends MessageMap> implements RequestClient<TRequest, TResponse> {
    private readonly responses;
    private sendEndpoint;
    private readonly requestType;
    private responseType;
    private readonly responseAddress;
    constructor(receiveEndpoint: ReceiveEndpoint, sendEndpoint: SendEndpoint, requestType: MessageType, responseType: MessageType);
    private onResponse;
}
