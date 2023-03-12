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
import fs from "fs-extra";
import { handleExecError } from "lib/common";
import envWrapper from "lib/executionEnvironment";
import os from "os";
import path from "path";

import type { HookField } from "lib/veraceConfig";
import cjsTranslate from "./cjs-translate";

export const parseHook = async (hook: HookField, args = "") => {
	const env = envWrapper.getInstance();
	const { log } = env;
	log().verbose("Parsing hook");
	try {
		const env = envWrapper.getInstance();
		if (typeof hook == "string") {
			log().verbose("Plain string hook detected");

			execHookCommand(`${hook} ${args}`);
		} else {
			log().verbose("Object hook found");

			if (hook.file && hook.file != "") {
				const fp = env.resolveFromRoot(hook.file);

				if (!fp.endsWith("js")) {
					throw new Error(
						`Hook file must be plain js: ${env.absolutePath(fp)}`
					);
				}

				if (!fs.existsSync(fp)) {
					throw new Error(
						`Path not found for hook running ${env.absolutePath(
							fp
						)}`
					);
				}
				try {
					log().verbose("Executing file hook");

					if (hook.file.endsWith("js"))
						await execJsHookFork(hook.file, args);
				} catch {
					return false;
				}
			} else if (hook.command && hook.command != "") {
				log().verbose("Command field given");

				await execHookCommand(`${hook.command} ${args}`);
			}
		}

		return true;
	} catch (e) {
		log().danger("Error executing hook.");
		if (e) console.log(e);
		return false;
	}
};

const execHookCommand = (cmd: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		const env = envWrapper.getInstance();
		const { log } = env;
		log().info(`Executing hook: ` + cmd);
		try {
			execSync(cmd, { stdio: "inherit" });
			resolve();
		} catch (e) {
			log().danger("Error executing hook command: ");
			handleExecError(e, env);
			reject();
		}
	});
};

const execJsHookFork = (fp: string, args = ""): Promise<void> => {
	return new Promise((resolve, reject) => {
		const env = envWrapper.getInstance();
		const { log } = env;
		log().info(`Executing hook file: ` + env.absolutePath(fp));
		try {
			const tmpFilePath = path.join(
				os.tmpdir(),
				`veracejs_${new Date().getTime()}_hook.cjs`
			);

			cjsTranslate(env.resolveFromRoot(fp), tmpFilePath);

			// fs.writeFileSync(tmpFilePath, compiledContents);
			const cmd = `node ${tmpFilePath} ${args}`;

			execSync(cmd, { stdio: "inherit" });

			if (tmpFilePath != "") fs.rmSync(tmpFilePath);

			resolve();
		} catch (e) {
			log().danger("Error executing hook file: ");
			handleExecError(e, env);
			reject();
			return;
		}
	});
};

const execGoHookFork = (fp: string, args = ""): Promise<void> => {
	return new Promise((resolve, reject) => {
		const env = envWrapper.getInstance();
		const { log } = env;
		log().info(`Executing hook file: ` + env.absolutePath(fp));
		try {
			let cmd = `node ${fp} ${args}`;
			execSync(cmd, { stdio: "inherit" });
			resolve();
		} catch (e) {
			log().danger("Error executing hook file: ");
			handleExecError(e, env);
			reject();
			return;
		}
	});
};
