import {MessageMap} from "./serialization"
import {ReceiveEndpoint} from "./receiveEndpoint"
import {Guid} from "guid-typescript"
import {SendEndpoint} from "./sendEndpoint"
import {ConsumeContext} from "./consumeContext"
import {MessageType} from "./messageType"

export interface RequestClient<TRequest extends MessageMap, TResponse extends MessageMap> {
    getResponse(request: TRequest): Promise<ConsumeContext<TResponse>>
}

export class RequestClient<TRequest extends MessageMap, TResponse extends MessageMap> implements RequestClient<TRequest, TResponse> {
    private readonly responses: RequestMap<TResponse>
    private sendEndpoint: SendEndpoint
    private readonly requestType: MessageType
    private responseType: MessageType
    private readonly responseAddress: string

    constructor(receiveEndpoint: ReceiveEndpoint, sendEndpoint: SendEndpoint, requestType: MessageType, responseType: MessageType) {
        this.sendEndpoint = sendEndpoint
        this.requestType = requestType
        this.responseType = responseType

        this.responseAddress = receiveEndpoint.address
        this.responses = {}

        receiveEndpoint.handle<TResponse>(responseType, response => this.onResponse(response))
    }

    getResponse(request: TRequest): Promise<ConsumeContext<TResponse>> {
        return new Promise<ConsumeContext<TResponse>>(async (resolve, reject) => {
            let requestId = Guid.create().toString()

            this.responses[requestId] = new ResponseFuture<TResponse>(requestId, resolve, reject)

            await this.sendEndpoint.send<TRequest>(request, x => {
                x.requestId = requestId
                x.responseAddress = this.responseAddress
                x.messageType = this.requestType.toMessageType()
            })
        })
    }

    private async onResponse(context: ConsumeContext<TResponse>): Promise<void> {
        if (context.requestId) {
            let pendingRequest = this.responses[context.requestId]
            if (pendingRequest) {
                pendingRequest.resolve(context)

                delete this.responses[context.requestId]
            }
        }
    }
}

class ResponseFuture<TResponse extends MessageMap> {
    requestId: string
    resolve: (value: ConsumeContext<TResponse> | PromiseLike<ConsumeContext<TResponse>>) => void
    reject: (reason?: any) => void

    constructor(requestId: string, resolve: (value: ConsumeContext<TResponse> | PromiseLike<ConsumeContext<TResponse>>) => void, reject: (reason?: any) => void) {
        this.resolve = resolve
        this.reject = reject
        this.requestId = requestId
    }
}

type RequestMap<TResponse extends MessageMap> = Record<string, ResponseFuture<TResponse>>
