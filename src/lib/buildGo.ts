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

import { runShellCmd, handleExecError } from "lib/common";
import fs from "fs-extra";
import Spinnies from "spinnies";

const spinner = {
	interval: 50,
	frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
};
const spinnies = new Spinnies({
	spinner,
	succeedColor: "white",
});
import envWrapper from "lib/executionEnvironment";

export default function (): Promise<void> {
	const env = envWrapper.getInstance();
	return new Promise((resolve, reject) => {
		const { config, log } = env;
		const mainGoPath = env.resolveFromRoot(env.entryPointPath);
		log().verbose(`Entrypoint path: ${mainGoPath}`);
		if (!fs.existsSync(mainGoPath)) {
			reject(`entrypoint ${mainGoPath} was not found`);
			return;
		}

		try {
			const promises = [];

			if (config.targets.includes("linux64")) {
				log().verbose("Add linux build");
				const buildCmd = `GOOS=linux cd ${env.wk} && go build -o ${config.outDir}/${config.name} ${env.entryPointPath}`;
				log().verbose(`Command: ${buildCmd}`);
				spinnies.add("linbuild", { text: "Building for linux64" });
				promises.push(runShellCmd(buildCmd, "linbuild", spinnies));
			}

			if (config.targets.includes("win64")) {
				log().verbose("Add windows build");
				const buildCmd = `GOOS=windows cd ${env.wk} && go build -o ${config.outDir}/${config.name}.exe ${env.entryPointPath}`;
				log().verbose(`Command: ${buildCmd}`);
				spinnies.add("winbuild", { text: "Building for win64" });
				promises.push(runShellCmd(buildCmd, "winbuild", spinnies));
			}

			Promise.all(promises)
				.then(() => {
					log().success("Build succeeded for all targets");
					resolve();
				})
				.catch(e => {
					handleExecError(e, env);
					reject(e);
				});
		} catch (e) {
			handleExecError(e, env);
			reject(e);
			return;
		}
	});
}
