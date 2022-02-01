import {MessageContext} from './messageContext';
import {Host} from './host';
import {MessageMap} from './serialization';
import {SendContext} from './sendContext';
import {ReceiveEndpoint} from './receiveEndpoint';
import {RabbitMqEndpointAddress} from './RabbitMqEndpointAddress';
import {AsyncReceiveEndpoint} from './AsyncReceiveEndpoint';

export interface ConsumeContext<T extends object> extends MessageContext {
    message: T;

    respond<T extends MessageMap>(message: T, cb?: (send: SendContext<T>) => void): Promise<void>
}

export class ConsumeContext<T extends object> implements ConsumeContext<T> {
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
    message!: T;

    async respond<T extends MessageMap>(message: T, cb?: (send: SendContext<T>) => void): Promise<void> {
        if (this.responseAddress) {
            let address = RabbitMqEndpointAddress.parse(this.receiveEndpoint.hostAddress, this.responseAddress);

            let sendEndpoint = this.receiveEndpoint.sendEndpoint({exchange: address.name, ...address});

            await sendEndpoint.send<T>(message, send => {
                send.requestId = this.requestId;
                if (cb) cb(send);
            });
        }

    }

    receiveEndpoint!: ReceiveEndpoint | AsyncReceiveEndpoint;
}


