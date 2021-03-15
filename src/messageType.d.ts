export declare class MessageType {
    name: string;
    ns: string;
    private static defaultNamespace;
    constructor(name: string, ns?: string);
    toString(): string;
    toMessageType(): Array<string>;
    static setDefaultNamespace(ns: string): void;
}
