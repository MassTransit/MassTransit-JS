import {Connection} from "amqplib"
import {RabbitMqHostAddress} from "./RabbitMqEndpointAddress"

export interface ConnectionContext {
    connection: Connection
    hostAddress: RabbitMqHostAddress
}

export class ConnectionContext implements ConnectionContext {
    connection: Connection
    hostAddress: RabbitMqHostAddress

    constructor(connection: Connection, hostAddress: RabbitMqHostAddress) {
        this.connection = connection
        this.hostAddress = hostAddress
    }
}