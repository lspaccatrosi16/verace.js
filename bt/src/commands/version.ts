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

import z from "zod";
import rustic from "rustic";

import envWrapper from "lib/executionEnvironment";

import type { BaseConfig } from "lib/veraceConfig";
import semver from "semver";
import zodWrapper from "src/lib/zodParserWithResult";

export default function () {
	const v = new Command("version").description("Manage package versions");
	v.action(() => {
		return version();
	});
	return v;
}

const version = (): Promise<void> => {
	return new Promise((resolve, reject) => {
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
				incrementVersion(increment).then(() => {
					resolve();
				});
			})
			.catch(reject);
	});
};

const versionIncrementParser = z.union([
	z.literal("patch"),
	z.literal("minor"),
	z.literal("major"),
	z.literal("prepatch"),
	z.literal("preminor"),
	z.literal("premajor"),
]);

export type VersionApi = z.infer<typeof versionIncrementParser>;

export async function versionApi(
	increment: unknown
): Promise<rustic.Result<null, string>> {
	const parsedIncrement = zodWrapper(versionIncrementParser, increment);

	if (parsedIncrement.isErr()) {
		return rustic.Err(parsedIncrement.unwrapErr());
	}
	await incrementVersion(parsedIncrement.unwrap());

	return rustic.Ok(null);
}

async function incrementVersion(increment: VersionApi) {
	await parseConfig("Version");
	const env = envWrapper.getInstance();
	const { config: cfg } = env;
	const { version } = cfg;
	const newVer = semver.inc(version, increment);

	const newConfig: BaseConfig = { ...cfg, version: newVer };

	const configLoc = env.resolveFromRoot("verace.json");

	fs.writeFileSync(configLoc, JSON.stringify(newConfig, null, "\t"));
}
