import { defaultReceiveEndpointOptions, ReceiveEndpoint, ReceiveEndpointOptions } from '../dist/receiveEndpoint';
import { RabbitMqHostAddress } from '../src/RabbitMqEndpointAddress';
import { Bus } from '../dist/bus';
import { ConfirmChannel } from 'amqplib';
import { ChannelContext } from '../dist/channelContext';
import { MessageType } from '../dist/messageType';

describe("ReceiveEndpoint", () => {
    let bus: jasmine.SpyObj<Bus>
    let context: jasmine.SpyObj<ChannelContext>
    let channel: jasmine.SpyObj<ConfirmChannel>

    let receiveEndpoint: ReceiveEndpoint

    beforeEach(() => {
        bus = jasmine.createSpyObj('Bus', ['on'], {
            hostAddress: new RabbitMqHostAddress({ host: '', virtualHost: '' })
        });
        const connection = jasmine.createSpyObj('Connection', ['createConfirmChannel']);
        channel = jasmine.createSpyObj('ConfirmChannel', [
            'on',
            'prefetch',
            'consume',
            'assertExchange',
            'assertQueue',
            'bindQueue',
            'bindExchange'
        ])
        channel.assertQueue.and.returnValue({queue: '', messageCount: 0, consumerCount: 0} as any)
        channel.consume.and.returnValue({ consumerTag: '' } as any)
        context = jasmine.createSpyObj('ChannelContext', [], {
            channel
        })
        connection.createConfirmChannel.and.returnValue(channel)
    })

    it("should configure default prefetch on connect", async () => {
        createReceiveEndpoint()

        await callOnChannel()

        expect(channel.prefetch).toHaveBeenCalledWith(defaultReceiveEndpointOptions.prefetchCount, defaultReceiveEndpointOptions.globalPrefetch)
    })

    describe("should configure prefetch on connect", () => {
        const testCases: [number, boolean][] = [
            [1, false],
            [1, true],
            [5, true]
        ]
        for (const [prefetchCount, globalPrefetch] of testCases) {
            it(`(${prefetchCount}, ${globalPrefetch})`, async () => {
                const options = {
                    ...defaultReceiveEndpointOptions,
                    prefetchCount,
                    globalPrefetch
                }
                createReceiveEndpoint('', options)

                await callOnChannel()

                expect(channel.prefetch).toHaveBeenCalledWith(prefetchCount, globalPrefetch)
            })
        }
    })

    describe("should assertExchange on connect", () => {
        const testCases: string[] = ["queue name", "another queue"]
        for (const queueName of testCases) {
            it(`(${queueName})`, async () => {
                createReceiveEndpoint(queueName)

                await callOnChannel()

                expect(channel.assertExchange).toHaveBeenCalledWith(queueName, 'fanout', defaultReceiveEndpointOptions)
            })
        }
    })

    describe("should assertQueue on connect", () => {
        const testCases: string[] = ["queue name", "another queue"]
        for (const queueName of testCases) {
            it(`(${queueName})`, async () => {
                createReceiveEndpoint(queueName)

                await callOnChannel()

                expect(channel.assertQueue).toHaveBeenCalledWith(queueName, defaultReceiveEndpointOptions)
            })
        }
    })

    describe("should bindQueue on connect", () => {
        const testCases: string[] = ["queue name", "another queue"]
        for (const queueName of testCases) {
            it(`(${queueName})`, async () => {
                createReceiveEndpoint(queueName)

                await callOnChannel()

                expect(channel.bindQueue).toHaveBeenCalledWith(queueName, queueName, '')
            })
        }
    })

    describe("should bind exchanges for every event bound via handle", () => {
        const testCases: [string, MessageType][] = [
            ["queue name", new MessageType("Event")],
            ["another queue", new MessageType("Message", "Contract")]
        ]
        for (const [queueName, messageType] of testCases) {
            it(`(${queueName})`, async () => {
                createReceiveEndpoint(queueName)
                receiveEndpoint.handle(messageType, jasmine.createSpy())

                await callOnChannel()

                expect(channel.bindExchange).toHaveBeenCalledWith(queueName, messageType.toExchange(), '')
            })
        }
    })

    async function callOnChannel(): Promise<void> {
        // TODO: this is a hack so we can actually test the channel setup
        await (receiveEndpoint as any).onChannel(context);
    }

    function createReceiveEndpoint(queueName: string = '', options?: ReceiveEndpointOptions) {
        receiveEndpoint = new ReceiveEndpoint(bus, queueName, undefined, options)
    }
})