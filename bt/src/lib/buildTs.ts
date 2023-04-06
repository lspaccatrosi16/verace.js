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

import { execSync, spawnSync } from "child_process";
import { rmSync } from "fs";
import fs from "fs-extra";
import { handleExecError, runShellCmd } from "lib/common";
import envWrapper from "lib/executionEnvironment";
import path from "path";
import Spinnies from "spinnies";

import crawlFiles from "./fileCrawl";
import { parseHook } from "./hooks";
import veraceTempJS from "./veraceTempJS";

import type { BaseConfig } from "./veraceConfig";

const spinner = {
	interval: 50,
	frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
};
const spinnies = new Spinnies({
	spinner,
	succeedColor: "white",
});

import rustic from "rustic";
import type { Result } from "rustic";
const { Err, Ok } = rustic;

const cleanUp = (config: BaseConfig) => {
	if (config.ts.cleanAfterBuild && fs.existsSync("tsc-build"))
		fs.rmSync("tsc-build", { recursive: true, force: true });

	if (fs.existsSync("build"))
		fs.rmSync("build", { recursive: true, force: true });

	if (
		config.ts.cleanAfterBuild &&
		!config.ts.skipPkg &&
		fs.existsSync("dist")
	)
		fs.rmSync("dist", { recursive: true, force: true });

	if (fs.existsSync("dist/pkg.config.json")) {
		fs.rmSync("dist/pkg.config.json", { force: true });
	}
};
import type { baseconfig } from "./baseConfig";
import cjsTranslate from "./cjs-translate";
export default function (): Promise<Result<void, string>> {
	const env = envWrapper.getInstance();
	const { config, log } = env;
	return new Promise((resolve, reject) => {
		const indexTsPath = env.resolveFromRoot(env.entryPointPath);
		if (fs.existsSync(indexTsPath)) {
			try {
				spinnies.add("esb", { text: "1. Bundling with ESBuild" });

				if (config.ts.produceTypes) {
					execSync(
						`cd ${env.wk} && npx tsc --declaration true --outDir ${config.ts.buildDir}`
					);
				} else {
					execSync(
						`cd ${env.wk} && npx tsc --declaration false --outDir ${config.ts.buildDir}`
					);
				}

				log().verbose("tsc run");

				execSync(`cd ${env.wk} && npx tsc-alias -f -p tsconfig.json`);

				log().verbose("tsc-alias run");

				if (config.ts.test != "") {
					log().verbose("Running tests");
					const newCmd = `cd ${env.wk} && ${config.ts.test}`;
					const cmds = newCmd.split(" ");
					const testRes = spawnSync(cmds[0], cmds.slice(1), {
						stdio: "inherit",
						shell: true,
					});

					if (testRes.error) {
						console.log(testRes.error);
						resolve(Err("Test failure"));
						return;
					} else {
						console.log(testRes.output.toString().trim());

						if (testRes.status != 0) {
							resolve(
								Err(
									`Test finished with status code ${testRes.status}`
								)
							);
							return;
						}
					}
				}

				if (fs.existsSync(env.resolveFromRoot(config.ts.assets)))
					fs.copySync(
						path.join(env.resolveFromRoot(config.ts.assets)),
						path.join(
							env.resolveFromRoot(config.ts.buildDir),
							config.ts.assets
						)
					);

				cjsTranslate(
					path.join(
						env.wk,
						config.ts.buildDir,
						`${env.entryPointName
							.split(".")
							.slice(0, -1)
							.join(".")}.js`
					),
					env.resolveFromRoot("build/veraceTemp.cjs")
				);

				fs.writeFileSync(
					env.resolveFromRoot("build/index.cjs"),
					veraceTempJS
				);

				cjsTranslate(
					env.resolveFromRoot("build/index.cjs"),
					env.resolveFromRoot(`dist/${config.name}.cjs`)
				);

				const oFile = fs
					.readFileSync(
						env.resolveFromRoot(`dist/${config.name}.cjs`)
					)
					.toString();

				const nFile = `#!/usr/bin/env node\n` + oFile;

				fs.writeFileSync(
					env.resolveFromRoot(`dist/${config.name}.cjs`),
					nFile
				);

				spinnies.succeed("esb");

				if (config.ts.skipPkg) {
					resolve(Ok(null));
					return;
				}

				try {
					const promises = [];

					if (config.targets.includes("linux64")) {
						promises.push(buildUniv("linux64"));
					}
					Promise.all(promises)
						.then(() => {
							if (config.targets.includes("win64")) {
								return buildUniv("win64");
							}
							return;
						})
						.then(() => {
							log().success(
								"All targets built for successfully."
							);
							cleanUp(config);
							resolve(Ok(null));
							return;
						});
				} catch (e) {
					resolve(Err(e));
					return;
				}
			} catch (e) {
				handleExecError(e, env);
				cleanUp(config);
				resolve(Err(e));
			}
		} else resolve(Err(`entrypoint ${indexTsPath} was not found`));
		return;
	});
}

const buildUniv = (target: (typeof baseconfig.targets)[0]): Promise<void> => {
	return new Promise((resolve, reject) => {
		let pkgTarget = "";
		if (target == "linux64") pkgTarget = "node16-linux";
		else pkgTarget = "node16-win";
		const env = envWrapper.getInstance();
		const { config, log } = env;

		evalPrePkgHool([target])
			.then(() => {
				log().verbose("hook resolved");
				const assets = crawlFiles(config.ts.assets);
				log().verbose(`Assets: ${assets.length}`);

				assets.forEach(a => {
					log().verbose(a);
				});

				const del = createConfig(config, assets);

				spinnies.add("builduniv", { text: `Building for ${target}` });

				runShellCmd(
					`cd ${env.wk} && npx pkg dist/"${config.name}.cjs" -o ${
						config.outDir
					}/${
						config.name
					} -C Gzip -t ${pkgTarget} -c dist/pkg.config.json${
						config.ts.noBytecode ? " --public --no-bytecode" : ""
					}`,
					"builduniv",
					spinnies
				)
					.then(() => {
						del.forEach(file => {
							rmSync(file, { force: true, recursive: true });
							log().verbose(`Deleted ${file}`);
						});
						resolve();
					})
					.catch(reject);
			})
			.catch(reject);
	});
};

const evalPrePkgHool = (target: typeof baseconfig.targets): Promise<void> => {
	return new Promise((resolve, reject) => {
		const tgt = target[0];
		const env = envWrapper.getInstance();
		const { config, log } = env;

		if (config.hooks && config.hooks.prePkg) {
			parseHook(config.hooks.prePkg, tgt)
				.then(status => {
					if (!status) {
						reject();
						return;
					}
					log().verbose("Hook done");

					resolve();
				})
				.catch(reject);
		} else {
			log().verbose("No hooks to apply");
			resolve();
		}
	});
};

const createConfig = (config: BaseConfig, assets: string[]) => {
	const env = envWrapper.getInstance();
	assets.forEach(file => {
		const dir = path.join("dist", path.dirname(file));

		fs.mkdirSync(dir, { recursive: true });
		fs.copySync(file, path.join("dist", file));
	});

	const cfg = {
		name: config.name,
		version: config.version,
		pkg: {
			assets: assets.map(file => path.join(file)),
		},
	};

	fs.writeFileSync(
		env.resolveFromRoot("dist/pkg.config.json"),
		JSON.stringify(cfg, null, "\t")
	);

	return [env.resolveFromRoot("dist/pkg.config.json")];
};
