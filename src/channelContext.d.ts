import { ConfirmChannel, Connection } from "amqplib";
import { ConnectionContext } from "./connectionContext";
export interface ChannelContext extends ConnectionContext {
    channel: ConfirmChannel;
}
export declare class ChannelContext extends ConnectionContext implements ChannelContext {
    channel: ConfirmChannel;
    constructor(connection: Connection, channel: ConfirmChannel, brokerUrl: string);
}
