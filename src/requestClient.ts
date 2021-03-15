import {MessageMap} from "./serialization"
import {ReceiveEndpoint} from "./receiveEndpoint"
import {Guid} from "guid-typescript"
import {SendEndpoint} from "./sendEndpoint"
import {ConsumeContext} from "./consumeContext"

export interface RequestClient<TRequest extends MessageMap, TResponse extends MessageMap> {

    getResponse(request: TRequest): Promise<ConsumeContext<TResponse>>
}

class PendingRequest<TResponse extends MessageMap> {
    requestId: string
    resolve: (value: ConsumeContext<TResponse> | PromiseLike<ConsumeContext<TResponse>>) => void
    reject: (reason?: any) => void

    constructor(requestId: string, resolve: (value: ConsumeContext<TResponse> | PromiseLike<ConsumeContext<TResponse>>) => void, reject: (reason?: any) => void) {
        this.resolve = resolve
        this.reject = reject
        this.requestId = requestId
    }

}

export type RequestMap<TResponse extends MessageMap> = Record<string, PendingRequest<TResponse>>

export class RequestClient<TRequest extends MessageMap, TResponse extends MessageMap> implements RequestClient<TRequest, TResponse> {
    private readonly pendingRequests: RequestMap<TResponse>
    private receiveEndpoint: ReceiveEndpoint
    private sendEndpoint: SendEndpoint
    private readonly requestType: string
    private responseType: string

    constructor(receiveEndpoint: ReceiveEndpoint, sendEndpoint: SendEndpoint, requestType: string, responseType: string) {
        this.receiveEndpoint = receiveEndpoint
        this.sendEndpoint = sendEndpoint
        this.requestType = requestType
        this.responseType = responseType

        this.pendingRequests = {}

        receiveEndpoint.handle<TResponse>(responseType, response => this.onResponse(response))

    }

    getResponse(request: TRequest): Promise<ConsumeContext<TResponse>> {

        return new Promise<ConsumeContext<TResponse>>(async (resolve, reject) => {
            let requestId = Guid.create().toString()

            this.pendingRequests[requestId] = new PendingRequest<TResponse>(requestId, resolve, reject)

            await this.sendEndpoint.send<TRequest>(request, x => {
                x.requestId = requestId
                x.responseAddress = this.receiveEndpoint.address
                x.messageType = [this.requestType]
            })
        })
    }

    private async onResponse(context: ConsumeContext<TResponse>): Promise<void> {
        if (context.requestId) {

            let pendingRequest = this.pendingRequests[context.requestId]
            if (pendingRequest) {
                pendingRequest.resolve(context)
            }

            delete this.pendingRequests[context.requestId]
        }
    }
}