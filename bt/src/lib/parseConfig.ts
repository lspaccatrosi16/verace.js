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
import path from "path";
import { BaseConfig, validate } from "./veraceConfig";
import envWrapper from "lib/executionEnvironment";

export function parseConfig(command: string): Promise<void> {
	const env = envWrapper.getInstance();
	const { log } = env;
	return new Promise((resolve, reject) => {
		const expectedPath = env.absolutePath(env.confPath);

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

					env.setConfig(config);

					resolve();
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
