import { Connection } from "amqplib";
export interface ConnectionContext {
    connection: Connection;
    brokerUrl: string;
}
export declare class ConnectionContext implements ConnectionContext {
    connection: Connection;
    brokerUrl: string;
    constructor(connection: Connection, brokerUrl: string);
}
