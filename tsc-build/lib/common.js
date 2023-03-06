import child_process from "child_process";
import os from "os";
const convToWin = (cmd) => {
    if (os.platform() == "win32") {
        const strAsArr = cmd.split("");
        for (let i = 0, len = strAsArr.length; i < len; i++) {
            const currentLetter = strAsArr[i];
            if (currentLetter == "/" && os.platform() == "win32") {
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
export const handleExecError = (e) => {
    console.log(e);
    if (e.stdout) {
        console.log(e.stdout.toString());
    }
    if (e.stderr) {
        console.log(e.stderr.toString());
    }
};
