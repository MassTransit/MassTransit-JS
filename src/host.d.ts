export interface Host {
    machineName?: string;
    processName?: string;
    processId?: number;
    assembly?: string;
    assemblyVersion?: string;
    frameworkVersion?: string;
    massTransitVersion?: string;
    operatingSystemVersion?: string;
}
export declare const defaultHost: Host;
export declare function host(): Host;
