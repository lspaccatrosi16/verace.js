import { Command } from "commander";
import { writeFileSync } from "fs-extra";
import inquirer from "inquirer";
import make_logger from "lib/log";
import { parseConfig } from "lib/parseConfig";

import type { BaseConfig } from "lib/veraceConfig";
import semver from "semver";
const log = make_logger();

export default function () {
	const v = new Command("version").description("Manage package versions");

	v.action(version);

	return v;
}

const version = (): Promise<void> => {
	return new Promise((resolve, reject) => {
		parseConfig(log, "Version").then((cfg) => {
			const { version } = cfg;
			inquirer
				.prompt({
					type: "list",
					message: "Select version increment type",
					choices: ["patch", "minor", "major", "prepatch", "preminor", "premajor"],
					name: "increment",
				})
				.then(({ increment }) => {
					const newVer = semver.inc(version, increment);

					const newConfig: BaseConfig = { ...cfg, version: newVer };

					writeFileSync("verace.json", JSON.stringify(newConfig, null, "\t"));
				});
		});
	});
};
