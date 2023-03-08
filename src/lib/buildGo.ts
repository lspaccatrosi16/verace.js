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
		if (!fs.existsSync(env.resolveFromRoot("main.go"))) {
			reject("main.go not found");
			return;
		}

		const { config, log } = env;

		try {
			const promises = [];

			if (config.targets.includes("linux64")) {
				spinnies.add("linbuild", { text: "Building for linux64" });
				promises.push(
					runShellCmd(
						`cd ${env.wk} && GOOS=linux go build -o bin/ `,
						"linbuild",
						spinnies
					)
				);
			}

			if (config.targets.includes("win64")) {
				spinnies.add("winbuild", { text: "Building for win64" });
				promises.push(
					runShellCmd(
						`cd ${env.wk} && GOOS=windows go build -o bin/ `,
						"winbuild",
						spinnies
					)
				);
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
