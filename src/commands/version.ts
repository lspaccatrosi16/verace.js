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

import { Command } from "commander";
import fs from "fs-extra";
import inquirer from "inquirer";
import { parseConfig } from "lib/parseConfig";

import envWrapper from "lib/executionEnvironment";

import type { BaseConfig } from "lib/veraceConfig";
import semver from "semver";

export default function () {
	const v = new Command("version").description("Manage package versions");
	v.action(() => {
		return version();
	});
	return v;
}

const version = (): Promise<void> => {
	return new Promise((resolve, reject) => {
		const env = envWrapper.getInstance();
		parseConfig("Version").then(() => {
			const { config: cfg } = env;
			const { version } = cfg;
			inquirer
				.prompt({
					type: "list",
					message: "Select version increment type",
					choices: [
						"patch",
						"minor",
						"major",
						"prepatch",
						"preminor",
						"premajor",
					],
					name: "increment",
				})
				.then(({ increment }) => {
					const newVer = semver.inc(version, increment);

					const newConfig: BaseConfig = { ...cfg, version: newVer };

					const configLoc = env.resolveFromRoot("verace.json");

					fs.writeFileSync(
						configLoc,
						JSON.stringify(newConfig, null, "\t")
					);

					resolve();
				})
				.catch(reject);
		});
	});
};
