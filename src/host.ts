export interface Host {
    machineName?: string
    processName?: string
    processId?: number
    assembly?: string
    assemblyVersion?: string
    frameworkVersion?: string
    massTransitVersion?: string
    operatingSystemVersion?: string
}

export const defaultHost: Host = {
    processId: process.pid,
    processName: process.title,
    frameworkVersion: process.version,
    operatingSystemVersion: process.platform,
    assembly: require.main?.filename,
}

export function host(): Host {
    return defaultHost
}
