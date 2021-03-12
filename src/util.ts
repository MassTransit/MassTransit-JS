export function delay(ms: number) {

    let handle: NodeJS.Timeout
    const promise = () => {
        return new Promise(resolve => {
            handle = setTimeout(resolve, ms)
            return handle
        })
    }

    return {promise, cancel: () => clearTimeout(handle)}
}