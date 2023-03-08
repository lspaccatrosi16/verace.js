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
