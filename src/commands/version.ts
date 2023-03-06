import { Command } from "commander";
import fs from "fs-extra";
import inquirer from "inquirer";
import type { LoggerType } from "lib/log";
import { parseConfig } from "lib/parseConfig";
import type { ExecutionEnvironment } from "lib/executionEnvironment";

import type { BaseConfig } from "lib/veraceConfig";
import semver from "semver";

export default function (env: ExecutionEnvironment) {
	const v = new Command("version").description("Manage package versions");

	v.action(() => version(env));

	return v;
}

const version = (env: ExecutionEnvironment): Promise<void> => {
	return new Promise((resolve, reject) => {
		parseConfig(env, "Version").then((cfg) => {
			env.setConfig(cfg);
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

					fs.writeFileSync("verace.json", JSON.stringify(newConfig, null, "\t"));
				});
		});
	});
};
