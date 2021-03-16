import {ConfirmChannel, ConsumeMessage, Options} from "amqplib"
import {Bus} from "./bus"
import {deserialize} from "class-transformer"
import {ConsumeContext} from "./consumeContext"
import {MessageContext} from "./messageContext"
import {MessageMap, MessageTypeDeserializer} from "./serialization"
import {SendEndpoint} from "./sendEndpoint"
import {SendEndpointArguments, Transport} from "./transport"
import {ChannelContext} from "./channelContext"
import {MessageType} from "./messageType"
import {EndpointSettings, RabbitMqEndpointAddress, RabbitMqHostAddress} from "./RabbitMqEndpointAddress"

/**
 * Configure the receive endpoint, including any message handlers
 */
export interface ReceiveEndpointConfigurator {
    queueName: string
    options: ReceiveEndpointOptions

    handle<T extends MessageMap>(messageType: MessageType, listener: (message: ConsumeContext<T>) => void): this
}

export interface ReceiveEndpoint {
    hostAddress: RabbitMqHostAddress
    address: RabbitMqEndpointAddress

    sendEndpoint(args: SendEndpointArguments): SendEndpoint
}

export class ReceiveEndpoint extends Transport implements ReceiveEndpointConfigurator, ReceiveEndpoint {
    queueName: string
    options: ReceiveEndpointOptions
    private readonly _messageTypes: MessageMap

    constructor(bus: Bus, queueName: string, options: ReceiveEndpointOptions = defaultReceiveEndpointOptions) {
        super(bus)

        this.queueName = queueName
        this.options = options

        let settings: EndpointSettings = {name: queueName, ...options}

        this.hostAddress = bus.hostAddress
        this.address = new RabbitMqEndpointAddress(bus.hostAddress, settings)

        this._messageTypes = {}

        this.on("channel", (context) => this.onChannel(context))
    }

    handle<T extends Record<string, any>>(messageType: MessageType, listener: (message: ConsumeContext<T>) => void): this {

        if (!messageType)
            throw new Error(`Invalid argument: messageType`)

        let typeName = messageType.toString()

        if (this._messageTypes.hasOwnProperty(typeName)) {
            this._messageTypes[typeName].on(listener)
        } else {
            let deserializer = new MessageTypeDeserializer<T>(this)
            this._messageTypes[typeName] = deserializer
            deserializer.on(listener)
        }

        return this
    }

    emitMessage(msg: ConsumeMessage): void {
        this.emit("message", msg)
    }

    private async onChannel(context: ChannelContext): Promise<void> {
        const _this = this

        let channel = context.channel

        await this.configureTopology(channel)

        let consume = await channel.consume(this.queueName, (msg: ConsumeMessage | null) => {
            if (msg === null) return

            try {
                _this.emit("message", msg)

                let text = msg.content.toString()

                let context = deserialize(MessageContext, text)

                if (context && context.messageType && context.messageType.length > 0) {

                    let messageType = context.messageType[0]

                    let deserializer = this._messageTypes[messageType]
                    if (deserializer instanceof MessageTypeDeserializer) {
                        deserializer.dispatch(text)
                    }
                }

                channel.ack(msg)
            }
            catch (e) {
                channel.reject(msg, true)
            }
        }, this.options)

        this.options.consumerTag = consume.consumerTag

        console.log("Receive endpoint started:", this.queueName, "ConsumerTag:", consume.consumerTag)
    }

    private async configureTopology(channel: ConfirmChannel) {
        await channel.prefetch(this.options.prefetchCount, this.options.globalPrefetch)

        await channel.assertExchange(this.queueName, "fanout", this.options)
        let queue = await channel.assertQueue(this.queueName, this.options)

        await channel.bindQueue(this.queueName, this.queueName, "")

        console.log("Queue:", queue.queue, "MessageCount:", queue.messageCount, "ConsumerCount:", queue.consumerCount)
    }
}

export interface ReceiveEndpointOptions extends Options.AssertQueue, Options.AssertExchange, Options.Consume {
    prefetchCount: number
    globalPrefetch: boolean
    exclusive?: boolean
    durable?: boolean
    autoDelete?: boolean
    arguments?: any
    messageTtl?: number
    expires?: number
    deadLetterExchange?: string
    deadLetterRoutingKey?: string
    maxLength?: number
    maxPriority?: number
}

export const defaultReceiveEndpointOptions: ReceiveEndpointOptions = {
    prefetchCount: 1,
    globalPrefetch: true,
    durable: true,
    autoDelete: false,
    noAck: false,
}


