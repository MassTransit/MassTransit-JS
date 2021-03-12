export class MessageType {
    name: string
    ns: string

    constructor(name: string, ns: string) {
        this.name = name
        this.ns = ns
    }

    toMessageType(): Array<string> {
        return ["urn:message:" + this.ns + ":" + this.name]
    }
}