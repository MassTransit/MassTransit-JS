export class MessageType {
    private static defaultNamespace: string = 'Messages';
    name: string;
    ns: string;

    constructor(name: string, ns?: string) {
        this.name = name;
        this.ns = ns ?? MessageType.defaultNamespace;
    }

    static setDefaultNamespace(ns: string) {
        this.defaultNamespace = ns;
    }

    toString(): string {
        return `urn:message:${this.ns}:${this.name}`;
    }

    toMessageType(): Array<string> {
        return [this.toString()];
    }

    toExchange(): string {
        return `${this.ns}:${this.name}`
    }
}

