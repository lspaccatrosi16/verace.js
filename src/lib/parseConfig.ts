import type { LoggerType } from "lib/log";
import { existsSync, readFileSync } from "fs-extra";
import path from "path";
import type { BaseConfig } from "./types";

export function parseConfig(log: LoggerType, command: string): Promise<BaseConfig> {
	return new Promise((resolve, reject) => {
		const expectedPath = path.join(process.cwd(), "fingo.json");

		if (!existsSync(expectedPath)) {
			reject("fingo.json not found in the current directory");
			return;
		}

		try {
			const config: BaseConfig = JSON.parse(readFileSync(expectedPath).toString());

			log().multi([
				[log().info().context, `${command}: `],
				[log().context, `${config.name}@${config.version}`],
			]);

			resolve(config);
			return;
		} catch (e) {
			if (e) log().danger(e.toString());
			reject(e);
			return;
		}
	});
}
