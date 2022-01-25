import {MessageType} from "../dist/messageType"

describe("messageType", () => {

    it("should support default namespace", function () {

        const messageType = new MessageType("SubmitOrder")

        expect(messageType.toString()).toBe("urn:message:Messages:SubmitOrder")
    })

    it("should support custom namespace", function () {

        const messageType = new MessageType("SubmitOrder", "Contracts")

        expect(messageType.toString()).toBe("urn:message:Contracts:SubmitOrder")
    })

    it("toExchange should return namespace with name without protocol", () => {
        const messageType = new MessageType("SubmitOrder")

        expect(messageType.toExchange()).toBe("Messages:SubmitOrder")
    })

    it("toExchange should support custom namespace", () => {
        const messageType = new MessageType("SubmitOrder", "Contracts")

        expect(messageType.toExchange()).toBe("Contracts:SubmitOrder")
    })
})