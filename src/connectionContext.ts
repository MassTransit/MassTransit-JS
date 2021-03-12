import {Connection} from "amqplib"

export interface ConnectionContext {
    connection: Connection
    brokerUrl: string
}

export class ConnectionContext implements ConnectionContext {
    connection: Connection
    brokerUrl: string

    constructor(connection: Connection, brokerUrl: string) {
        this.connection = connection
        this.brokerUrl = brokerUrl
    }
}