import {Guid} from "guid-typescript"
import {OrderSubmitted, SubmitOrder} from "./messages"
import readline from "readline"
import {MessageType} from '../dist/messageType';
import masstransit from '../dist/bus';

MessageType.setDefaultNamespace("Contracts")

const bus = masstransit()

bus.receiveEndpoint("orders", endpoint => {

    endpoint.handle<SubmitOrder>(new MessageType("SubmitOrder"), async context => {

        console.log("Order submission received, OrderId:", context.message.OrderId, "Amount:", context.message.Amount)

        await context.respond<OrderSubmitted>({OrderId: context.message.OrderId}, send => {
            send.messageType = new MessageType("OrderSubmitted").toMessageType()
        })
    })
})

let client = bus.requestClient<SubmitOrder, OrderSubmitted>({
    exchange: "orders",
    requestType: new MessageType("SubmitOrder"),
    responseType: new MessageType("OrderSubmitted"),
})

const submitOrder = setInterval(async () => {
    try {
        let response = await client.getResponse({OrderId: Guid.create().toString(), Amount: 123.45})

        console.log("Order submitted", response.message.OrderId)
    }
    catch (e) {
        console.error("failed to submit order", e.message)
    }
}, 1000)

process.on("SIGINT", async () => {
    clearInterval(submitOrder)
})
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

const start = async () => {
    for await (const line of rl) {
        if (line === "restart")
            bus.restart().then(() => console.log("restarted the bus"))

        if (line === "quit")
            break
    }
}
start()
    .then(async () => {
        await bus.stop()
        process.exit(0)
    })
