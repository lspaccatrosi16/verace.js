import type { LoggerType } from "lib/log";
import { existsSync, readFileSync } from "fs-extra";
import path from "path";
import type { BaseConfig } from "./baseConfig";

export function parseConfig(log: LoggerType): Promise<BaseConfig> {
  return new Promise((resolve, reject) => {
    const expectedPath = path.join(process.cwd(), "fingo.json");

    if (!existsSync(expectedPath)) {
      reject("fingo.json not found in the current directory");
      return;
    }

    try {
      const config: BaseConfig = JSON.parse(
        readFileSync(expectedPath).toString()
      );

      resolve(config);
      return;
    } catch (e) {
      if (e) log().danger(e.toString());
      reject(e);
      return;
    }
  });
}
