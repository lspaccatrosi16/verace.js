interface Opts {
    color: string;
    bold: boolean;
    underline: boolean;
}
export type uncalledFn = [Logger, string];
export type LoggerType = (str?: string) => Logger;
export default function make_logger(): (str?: string) => Logger;
declare class Logger {
    _color: string;
    _bold: boolean;
    _underline: boolean;
    maxWidth: 75;
    constructor(opts?: Opts);
    apply(str: string): Logger;
    _self(opts?: {}, print?: boolean): Logger;
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
    multi(parts: uncalledFn[]): void;
}
export {};
