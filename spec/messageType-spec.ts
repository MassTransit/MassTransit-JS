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
})