import { Transport } from '../dist/transport';
import { Bus } from '../dist/bus';
import { ConnectionContext } from '../dist/connectionContext';
import { ConfirmChannel } from 'amqplib';
import { SendContext } from '../dist/sendContext';
import { RabbitMqHostAddress } from '../src/RabbitMqEndpointAddress';

describe("Transport", () => {
    let bus: jasmine.SpyObj<Bus>
    let context: jasmine.SpyObj<ConnectionContext>
    let channel: jasmine.SpyObj<ConfirmChannel>

    let transport: Transport

    beforeEach(() => {
        bus = jasmine.createSpyObj('Bus', ['on'], {
            hostAddress: new RabbitMqHostAddress({ host: '', virtualHost: '' })
        });
        const connection = jasmine.createSpyObj('Connection', ['createConfirmChannel']);
        context = jasmine.createSpyObj('ConnectionContext', [], {
            connection
        })
        channel = jasmine.createSpyObj('ConfirmChannel', ['publish', 'on'])
        connection.createConfirmChannel.and.returnValue(channel)

        transport = new Transport(bus)
    })

    describe("send should publish the given message", () => {
        const testCases = [
            ['exchange', 'routingKey'],
            ['MessageExchange', 'RoutingKey']
        ]
        for (const [exchange, routingKey] of testCases) {
            it(`(${exchange}, ${routingKey})`, async () => {
                callPublishCallback()
                await callOnConnect()

                await transport.send(exchange, routingKey, new SendContext({}))

                expect(channel.publish).toHaveBeenCalledWith(exchange, routingKey, jasmine.any(Buffer), jasmine.any(Object), jasmine.any(Function))
            })
        }
    })

    it("send should set the contentType", async () => {
        callPublishCallback()
        await callOnConnect()

        await transport.send('', '', new SendContext({}))

        expect(channel.publish).toHaveBeenCalledWith(jasmine.any(String), jasmine.any(String), jasmine.any(Buffer), {
            persistent: true,
            contentType: "application/vnd.masstransit+json"
        }, jasmine.any(Function))
    })

    it("publishing after onConnect should set the contentType", async () => {
        callPublishCallback()
        transport.send('', '', new SendContext({}))

        await callOnConnect()

        expect(channel.publish).toHaveBeenCalledWith(jasmine.any(String), jasmine.any(String), jasmine.any(Buffer), {
            persistent: true,
            contentType: "application/vnd.masstransit+json"
        }, jasmine.any(Function))
    })

    function callPublishCallback() {
        channel.publish.and.callFake((exchange, routingKey, content, options, callback) => {
            if (callback != null) {
                callback(null, {});
            }
            return true;
        })
    }

    function callOnConnect() {
        const callback = bus.on.calls.first().args[1];

        return callback(context);
    }
})
