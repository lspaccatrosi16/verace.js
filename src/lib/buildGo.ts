import { runShellCmd, handleExecError } from "lib/common";
import fs from "fs-extra";
import Spinnies from "spinnies";

import path from "path";

import type { ExecutionEnvironment } from "lib/executionEnvironment";

const spinner = {
	interval: 50,
	frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
};
const spinnies = new Spinnies({
	spinner,
	succeedColor: "white",
});

export default function (env: ExecutionEnvironment): Promise<void> {
	return new Promise((resolve, reject) => {
		if (!fs.existsSync(path.join(env.wk, "main.go"))) {
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
						env,
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
						env,
						spinnies
					)
				);
			}

			Promise.all(promises)
				.then(() => {
					log().success("Build succeeded for all targets");
					resolve();
				})
				.catch((e) => {
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
