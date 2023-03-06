import fs from "fs-extra";
import path from "path";
import { BaseConfig, validate } from "./veraceConfig";
import type { ExecutionEnvironment } from "lib/executionEnvironment";

export function parseConfig(env: ExecutionEnvironment, command: string): Promise<BaseConfig> {
	const { log } = env;
	return new Promise((resolve, reject) => {
		const expectedPath = path.join(process.cwd(), env.confPath);

		if (!fs.existsSync(expectedPath)) {
			reject("verace.json not found in the current directory");
			return;
		}

		try {
			const unparsed: unknown = JSON.parse(fs.readFileSync(expectedPath).toString());

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
