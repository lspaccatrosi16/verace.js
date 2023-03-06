import type Spinnies from "spinnies";
import type { LoggerType } from "lib/log";
export declare const convToWin: (cmd: string, override?: boolean) => string;
export declare function runShellCmd(cmd: string, spinnerName: string, log: LoggerType, spinnies: Spinnies): Promise<void>;
export declare const handleExecError: (e: any, log: LoggerType) => void;
