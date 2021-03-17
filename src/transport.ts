import {SendContext} from './sendContext';
import {JsonMessageSerializer, MessageMap, MessageSerializer} from './serialization';
import {SendEndpoint} from './sendEndpoint';
import {ConfirmChannel, Connection} from 'amqplib';
import EventEmitter from 'events';
import {Bus} from './bus';
import {ConnectionContext} from './connectionContext';
import {ChannelContext} from './channelContext';
import {RabbitMqEndpointAddress} from './RabbitMqEndpointAddress';

export interface SendEndpointArguments {
    exchange?: string
    queue?: string
    routingKey?: string
    durable?: boolean
    autodelete?: boolean
    exchangeType?: string
}

export interface Transport {
    /**
     * Returns a send endpoint,  using the specified arguments
     *
     * @returns SendEndpoint - which can then be used to send messages
     *
     * @param args - specified the exchange, queue, and routing key for the endpoint
     */
    sendEndpoint(args: SendEndpointArguments): SendEndpoint

    send<T extends MessageMap>(exchange: string, routingKey: string, send: SendContext<T>): Promise<void>

    on(event: 'channel', listener: (context: ChannelContext) => void): this;

}

class PendingPublish {
    exchange: string;
    routingKey: string;
    message: Buffer;

    resolve: (value: boolean | PromiseLike<boolean>) => void;
    reject: (reason?: any) => void;

    constructor(exchange: string, routingKey: string, message: Buffer, resolve: (value: boolean | PromiseLike<boolean>) => void, reject: (reason?: any) => void) {
        this.exchange = exchange;
        this.routingKey = routingKey;
        this.message = message;
        this.resolve = resolve;
        this.reject = reject;
    }
}

export class Transport extends EventEmitter implements Transport {
    protected connection?: Connection;
    protected channel?: ConfirmChannel;
    protected bus: Bus;
    private pendingPublishQueue: Array<PendingPublish>;
    private readonly serializer: MessageSerializer;

    constructor(bus: Bus) {
        super();

        this.bus = bus;
        this.setMaxListeners(0);

        this.serializer = new JsonMessageSerializer();
        this.pendingPublishQueue = new Array<PendingPublish>();

        bus.on('connect', (context) => this.onConnect(context));
    }

    sendEndpoint(args: SendEndpointArguments): SendEndpoint {
        if (!args.exchange && !args.queue)
            throw new Error('An exchange or a queue name must be specified');

        let exchange: string = args.exchange ?? '';
        let routingKey = (args.exchange ? args.routingKey : args.queue) ?? '';

        return new SendEndpoint(this, exchange, routingKey);
    }

    async send<T extends MessageMap>(exchange: string, routingKey: string, send: SendContext<T>) {

        let destination = exchange;
        if (!destination || destination === '')
            destination = routingKey;

        send.destinationAddress = new RabbitMqEndpointAddress(this.bus.hostAddress, {name: destination}).toString();

        const body = this.serializer.serialize(send);

        await this.basicPublish(exchange, routingKey, body);
    }

    async onConnect(context: ConnectionContext): Promise<void> {
        if (this.connection && this.connection === context.connection)
            return;

        this.connection = context.connection;

        let channel = await context.connection.createConfirmChannel();

        channel.on('error', err => {
            console.error('Channel error', err.message);
        });
        channel.on('close', () => {
            this.connection = undefined;
            this.channel = undefined;
        });

        this.channel = channel;

        this.emit('channel', {...context, channel});

        while (true) {
            let pendingPublish = this.pendingPublishQueue.shift();
            if (!pendingPublish) break;

            let {exchange, message, routingKey} = pendingPublish;

            await this.basicPublish(exchange, routingKey, message);
        }
    }

    private async basicPublish(exchange: string, routingKey: string, body: Buffer): Promise<boolean> {

        if (this.channel) {
            let channel = this.channel;
            return new Promise((resolve, reject) => {
                const result = channel.publish(exchange, routingKey, body, {persistent: true},
                    err => {
                        if (err) {
                            reject(err);
                        } else {
                            setImmediate(() => resolve(result));
                        }
                    });

            });
        } else
            return new Promise((resolve, reject) => {
                this.pendingPublishQueue.push(new PendingPublish(exchange, routingKey, body, resolve, reject));
            });
    }
}