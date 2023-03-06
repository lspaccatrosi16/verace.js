import type Spinnies from "spinnies";
import child_process from "child_process";
import os from "os";

import type { LoggerType } from "lib/log";

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

export const handleExecError = (e: any, log: LoggerType) => {
  log(e);
  if (e.stdout) {
    log((e.stdout as Buffer).toString());
  }
  if (e.stderr) {
    log((e.stderr as Buffer).toString());
  }
};
