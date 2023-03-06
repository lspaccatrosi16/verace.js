import child_process from "child_process";
import os from "os";
export const convToWin = (cmd, override = false) => {
    if (os.platform() == "win32" || override) {
        const strAsArr = cmd.split("");
        for (let i = 0, len = strAsArr.length; i < len; i++) {
            const currentLetter = strAsArr[i];
            if (currentLetter == "/") {
                strAsArr[i] = "\\";
            }
        }
        return strAsArr.join("");
    }
    else
        return cmd;
};
export function runShellCmd(cmd, spinnerName, log, spinnies) {
    const newCmd = convToWin(cmd);
    return new Promise((resolve, reject) => {
        child_process.exec(newCmd, { maxBuffer: 1024 * 1024 * 1024 }, (err, stdout, stderr) => {
            if (err) {
                spinnies.stopAll("fail");
                log().danger(err.toString());
                log().danger(stdout);
                log().danger(stderr);
                reject();
            }
            spinnies.succeed(spinnerName);
            resolve();
        });
    });
}
export const handleExecError = (e, log) => {
    log(e);
    if (e.stdout) {
        log(e.stdout.toString());
    }
    if (e.stderr) {
        log(e.stderr.toString());
    }
};
