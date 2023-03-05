import type { LoggerType } from "lib/log";
import { existsSync, readFileSync } from "fs-extra";
import path from "path";
import { BaseConfig, validate } from "./veraceConfig";

export function parseConfig(log: LoggerType, command: string): Promise<BaseConfig> {
	return new Promise((resolve, reject) => {
		const expectedPath = path.join(process.cwd(), "verace.json");

		if (!existsSync(expectedPath)) {
			reject("verace.json not found in the current directory");
			return;
		}

		try {
			const unparsed: unknown = JSON.parse(readFileSync(expectedPath).toString());

			validate(unparsed)
				.then((config) => {
					log().multi([
						[log().info().context, `${command}: `],
						[log().context, `${config.name}@${config.version}`],
					]);

					resolve(config);
					return;
				})
				.catch((e) => {
					if (e) log().danger(e.toString());
					reject(e);
					return;
				});
		} catch (e) {
			if (e) log().danger(e.toString());
			reject(e);
			return;
		}
	});
}
