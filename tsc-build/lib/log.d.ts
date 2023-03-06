interface Opts {
    color: string;
    bold: boolean;
    underline: boolean;
}
export type uncalledFn = [Logger, string];
export type LoggerType = (str?: string) => Logger;
export default function make_logger(testMode?: boolean): (str?: string) => Logger;
declare class Logger {
    _color: string;
    _bold: boolean;
    _underline: boolean;
    maxWidth: 75;
    testMode: boolean;
    constructor(testMode: boolean, opts?: Opts);
    apply(str: string): Logger;
    private _self;
    citrus(str?: string): Logger;
    grey(str?: string): Logger;
    bold(str?: string): Logger;
    underline(str?: string): Logger;
    danger(str?: string): Logger;
    warn(str?: string): Logger;
    info(str?: string): Logger;
    success(str?: string): Logger;
    get context(): this;
    private _logTree;
    private _log;
    private sanitiseString;
    multi(parts: uncalledFn[]): string;
    get dumpBuffer(): string;
    private StdoutWrite;
}
export {};
