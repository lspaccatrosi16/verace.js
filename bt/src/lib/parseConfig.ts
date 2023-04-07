/*
Copyright (C) 2023  Luca Spaccatrosi

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/

import fs from "fs-extra";
import { validate } from "./veraceConfig";
import envWrapper from "lib/executionEnvironment";
import rustic from "rustic";
import type { Result } from "rustic";
const { Err, isOk, Ok } = rustic;
export function parseConfig(command: string): Promise<Result<void, string>> {
	const env = envWrapper.getInstance();
	const { log } = env;
	return new Promise((resolve, reject) => {
		const cpath = env.confPath;
		if (!isOk(cpath)) {
			reject("No config path provided and could not detect one");
			return;
		}
		const expectedPath = env.absolutePath(cpath.data);

		if (!fs.existsSync(expectedPath)) {
			reject("not found: " + expectedPath);
			return;
		}

		if (!fs.lstatSync(expectedPath).isFile()) {
			reject(`${expectedPath} is not a file`);
			return;
		}

		try {
			findConfig(expectedPath)
				.then((unparsed: unknown) => {
					return validate(unparsed);
				})
				.then(config => {
					log().multi([
						[log().info().context, `${command}: `],
						[log().context, `${config.name}@${config.version}`],
					]);

					env.setConfig(config);

					resolve(Ok(null));
					return;
				})
				.catch(e => {
					resolve(Err(e));
					return;
				});
		} catch (e) {
			resolve(Err(e));
			return;
		}
	});
}

function findConfig(expectedPath: string): Promise<unknown> {
	return new Promise((resolve, reject) => {
		if (expectedPath.endsWith(".json")) {
			resolve(JSON.parse(fs.readFileSync(expectedPath).toString()));
		} else if (expectedPath.endsWith(".mjs")) {
			console.log("thinking about importing it");
			import(expectedPath)
				.then((unparsed: undefined | Record<string, unknown>) => {
					console.log("Imported file");
					if (
						typeof unparsed != "undefined" &&
						"default" in unparsed
					) {
						resolve(unparsed.default);
					} else {
						reject(
							"Must use the defineConfig function for a js config file and default export it"
						);
					}
				})
				.catch(e => {
					reject(e);
				});
		} else {
			reject(
				`config file must either be a .js or a .json, not: ${expectedPath}`
			);
			return;
		}
	});
}
