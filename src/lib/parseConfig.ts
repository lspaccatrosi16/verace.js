import fs from "fs-extra";
import path from "path";
import { BaseConfig, validate } from "./veraceConfig";
import envWrapper from "lib/executionEnvironment";

export function parseConfig(command: string): Promise<BaseConfig> {
	const env = envWrapper.getInstance();
	const { log } = env;
	return new Promise((resolve, reject) => {
		const expectedPath = path.join(process.cwd(), env.confPath);

		if (!fs.existsSync(expectedPath)) {
			reject("not found: " + expectedPath);
			return;
		}

		if (!fs.lstatSync(expectedPath).isFile()) {
			reject(`${expectedPath} is not a file`);
			return;
		}

		try {
			const unparsed: unknown = JSON.parse(
				fs.readFileSync(expectedPath).toString()
			);

			validate(unparsed)
				.then(config => {
					log().multi([
						[log().info().context, `${command}: `],
						[log().context, `${config.name}@${config.version}`],
					]);

					resolve(config);
					return;
				})
				.catch(e => {
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
