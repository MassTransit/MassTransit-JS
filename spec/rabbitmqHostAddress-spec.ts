import {RabbitMqHostAddress} from "../dist/RabbitMqEndpointAddress"

describe("Specifying a URL host address", () => {

    it("should match the default virtual host without a trailing slash", function () {

        let hostAddress =  RabbitMqHostAddress.parse("rabbitmq://localhost")

        expect(hostAddress.virtualHost).toBe("/")
    })

    it("should match the default virtual host with a trailing slash", function () {

        let hostAddress = RabbitMqHostAddress.parse("rabbitmq://localhost/")

        expect(hostAddress.virtualHost).toBe("/")
    })

    it("should match the virtual host with a trailing slash", function () {

        let hostAddress = RabbitMqHostAddress.parse("rabbitmq://localhost/test/")

        expect(hostAddress.virtualHost).toBe("test")
    })

    it("should match the virtual host without a trailing slash", function () {

        let hostAddress = RabbitMqHostAddress.parse("rabbitmq://localhost/test")

        expect(hostAddress.virtualHost).toBe("test")
    })

    it("should match the virtual host with a queue name", function () {

        let hostAddress = RabbitMqHostAddress.parse("rabbitmq://localhost/test/some-queue")

        expect(hostAddress.virtualHost).toBe("test")
    })

})