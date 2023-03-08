import { Command } from "commander";
import fs from "fs-extra";
import inquirer from "inquirer";
import { parseConfig } from "lib/parseConfig";

import envWrapper from "lib/executionEnvironment";

import type { BaseConfig } from "lib/veraceConfig";
import semver from "semver";

export default function () {
	const v = new Command("version").description("Manage package versions");

	const env = envWrapper.getInstance();
	v.action(() => {
		const opts = v.optsWithGlobals();
		if (opts.path && opts.path != "") {
			env.setConfigPath(opts.path);
		}
		return version();
	});
	return v;
}

const version = (): Promise<void> => {
	return new Promise((resolve, reject) => {
		const env = envWrapper.getInstance();
		parseConfig("Version").then(cfg => {
			env.setConfig(cfg);
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
