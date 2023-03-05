import type Spinnies from "spinnies";
import child_process from "child_process";
import os from "os";

import type { LoggerType } from "lib/log";

const convToWin = (cmd: string): string => {
	if (os.platform() == "win32") {
		const strAsArr = cmd.split("");
		for (let i = 0, len = strAsArr.length; i < len; i++) {
			const currentLetter = strAsArr[i];

			if (currentLetter == "/" && os.platform() == "win32") {
				strAsArr[i] = "\\";
			}
		}
		return strAsArr.join("");
	} else return cmd;
};

export function runShellCmd(
	cmd: string,
	spinnerName: string,
	log: LoggerType,
	spinnies: Spinnies
): Promise<void> {
	const newCmd = convToWin(cmd);
	return new Promise((resolve, reject) => {
		child_process.exec(
			newCmd,
			{ maxBuffer: 1024 * 1024 * 1024 },
			(err: child_process.ExecException, stdout: string, stderr: string) => {
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

export const handleExecError = (e: any) => {
	console.log(e);
	if (e.stdout) {
		console.log((e.stdout as Buffer).toString());
	}
	if (e.stderr) {
		console.log((e.stderr as Buffer).toString());
	}
};
