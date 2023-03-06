import type { LoggerType } from "lib/log";
import { BaseConfig } from "./veraceConfig";
export declare function parseConfig(log: LoggerType, command: string): Promise<BaseConfig>;
