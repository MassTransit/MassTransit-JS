import masstransit from "../src/bus"
import {Guid} from "guid-typescript"
import {SubmitOrder} from "./messages"
import readline from "readline"

const bus = masstransit()

bus.receiveEndpoint("orders", endpoint => {

    endpoint.handle<SubmitOrder>("urn:message:Contracts:SubmitOrder", context => {

        console.log("Order Submitted, OrderId:", context.message.OrderId, "Amount:", context.message.Amount)
    })
})

let endpoint = bus.sendEndpoint({queue: "orders"})

const submitOrder = setInterval(async () => {
    try {
        await endpoint.send<SubmitOrder>({OrderId: Guid.create().toString(), Amount: 123.45}, x => {
            x.requestId = Guid.create().toString()
            x.setMessageType("SubmitOrder", "Contracts")
        })
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
