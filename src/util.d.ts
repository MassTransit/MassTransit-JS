export declare function delay(ms: number): {
    promise: () => Promise<unknown>;
    cancel: () => void;
};
