export class MessageType {
    name: string
    ns: string

    private static defaultNamespace: string = "Messages"

    constructor(name: string, ns?: string) {
        this.name = name
        this.ns = ns ?? MessageType.defaultNamespace
    }

    toString(): string {
        return `urn:message:${this.ns}:${this.name}`
    }

    toMessageType(): Array<string> {
        return [this.toString()]
    }

    static setDefaultNamespace(ns: string) {
        this.defaultNamespace = ns
    }
}

