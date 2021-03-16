import {ConfirmChannel, Connection} from "amqplib"
import {ConnectionContext} from "./connectionContext"
import {RabbitMqHostAddress} from "./RabbitMqEndpointAddress"

export interface ChannelContext extends ConnectionContext {
    channel: ConfirmChannel
}

export class ChannelContext extends ConnectionContext implements ChannelContext {
    channel: ConfirmChannel

    constructor(connection: Connection, channel: ConfirmChannel, hostAddress : RabbitMqHostAddress) {
        super(connection, hostAddress)

        this.channel = channel
    }
}