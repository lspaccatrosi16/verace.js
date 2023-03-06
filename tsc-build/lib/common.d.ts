import type Spinnies from "spinnies";
import type { LoggerType } from "lib/log";
export declare function runShellCmd(cmd: string, spinnerName: string, log: LoggerType, spinnies: Spinnies): Promise<void>;
export declare const handleExecError: (e: any) => void;
