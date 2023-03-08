import type Spinnies from "spinnies";
import child_process from "child_process";
import os from "os";

import type { ExecutionEnvironment } from "lib/executionEnvironment";
import envWrapper from "lib/executionEnvironment";

export const convToWin = (cmd: string, override = false): string => {
	if (os.platform() == "win32" || override) {
		const strAsArr = cmd.split("");
		for (let i = 0, len = strAsArr.length; i < len; i++) {
			const currentLetter = strAsArr[i];

			if (currentLetter == "/") {
				strAsArr[i] = "\\";
			}
		}
		return strAsArr.join("");
	} else return cmd;
};

export function runShellCmd(
	cmd: string,
	spinnerName: string,
	spinnies: Spinnies
): Promise<void> {
	const env = envWrapper.getInstance();
	const { log } = env;
	const newCmd = convToWin(cmd);
	return new Promise((resolve, reject) => {
		child_process.exec(
			newCmd,
			{ maxBuffer: 1024 * 1024 * 1024 },
			(
				err: child_process.ExecException,
				stdout: string,
				stderr: string
			) => {
				if (err) {
					spinnies.stopAll("fail");
					log().danger(err.toString());
					log().danger(stdout);
					log().danger(stderr);
					reject();
				}

				spinnies.succeed(spinnerName);

				resolve();
			}
		);
	});
}

export const handleExecError = (e: any, env: ExecutionEnvironment) => {
	process.stdout.write(e.toString() + "\n");
	if (e.stdout) {
		process.stdout.write((e.stdout as Buffer).toString() + "\n");
	}
	if (e.stderr) {
		process.stdout.write((e.stderr as Buffer).toString() + "\n");
	}
};
