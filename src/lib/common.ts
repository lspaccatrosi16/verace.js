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

export function runChildProcess(cmd: string, name: string, log: LoggerType) {
  const newCmd = convToWin(cmd);

  const child = child_process.exec(newCmd, {
    maxBuffer: 1024 * 1024 * 100,
  });
  child.stdout.on("data", (message) => {
    if (name == "noprep") log(message.toString());
    else log(`[${name}]: ${message.toString()}`);
  });

  child.stdout.on("error", (err: Error) => {
    log("")
      .underline()
      .danger(err.name + "\n\n");
    log().danger(err.message + "\n");
    log(err.stack);
    process.exit(1);
  });
}
export function runChildProcessPromise(
  cmd: string,
  name: string,
  log: LoggerType
): Promise<void> {
  return new Promise((resolve) => {
    const newCmd = convToWin(cmd);

    runChildProcess(newCmd, name, log);
    resolve();
  });
}

export const createError = (log: LoggerType, str: string, val: string) => {
  log().multi([
    [log().danger().context, str],
    [log().danger().underline().context, val],
  ]);
};

export const createWarn = (log: LoggerType, str: string, val: string) => {
  log().multi([
    [log().warn().context, str],
    [log().warn().underline().context, val],
  ]);
};

export const createSuccess = (log: LoggerType, str: string, val: string) => {
  log().multi([
    [log().success().context, str],
    [log().success().underline().context, val],
  ]);
};

export const timer = () => {
  return new Timer();
};

class Timer {
  private descStr: string;
  private log: LoggerType;
  private time_start: [number, number];

  private self() {
    return this;
  }

  start(log: LoggerType, str: string) {
    this.descStr = str;
    this.log = log;
    this.time_start = process.hrtime();
    return this.self();
  }

  private toSec(time: [number, number]) {
    return time[0] + time[1] / 1e9;
  }

  private print(str: string) {
    const log = this.log;

    log().multi([
      [log().info(), `${this.descStr}: `],
      [log().citrus().bold(), str],
    ]);
  }

  end() {
    const end = process.hrtime(this.time_start);
    const str = this.toSec(end).toFixed(2) + " s";
    this.print(str);
  }

  endts() {
    const end = process.hrtime(this.time_start);
    const str = this.toTimeString(end);
    this.print(str);
  }
  private toTimeString(time: [number, number]) {
    const in_secs: number = this.toSec(time);
    const hours: number = Math.floor(in_secs / 3600);
    const minutes: number = Math.floor(in_secs / 60 - hours * 60);
    const seconds: number = Math.floor(in_secs - hours * 3600 - minutes * 60);

    return `${hours}h ${minutes}m ${seconds}s`;
  }
}

export const testos = (os: typeof process.platform) => {
  if (process.platform == os) return true;
  return false;
};

export const assertLinux = (log: LoggerType, cmd: string) => {
  if (!testos("linux")) {
    createError(log, "Command is only supported on linux: ", cmd);
  }
};

export const handleExecError = (e: any) => {
  console.log(e);
  if (e.stdout) {
    console.log((e.stdout as Buffer).toString());
  }
  if (e.stderr) {
    console.log((e.stderr as Buffer).toString());
  }
};
