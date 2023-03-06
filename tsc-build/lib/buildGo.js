import { runShellCmd, handleExecError } from "lib/common";
import make_logger from "lib/log";
import { existsSync } from "fs-extra";
import Spinnies from "spinnies";
const log = make_logger();
const spinner = {
    interval: 50,
    frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
};
const spinnies = new Spinnies({
    spinner,
    succeedColor: "white",
});
export default function (config) {
    return new Promise((resolve, reject) => {
        if (!existsSync("main.go")) {
            reject("main.go not found");
            return;
        }
        try {
            const promises = [];
            if (config.targets.includes("linux64")) {
                spinnies.add("linbuild", { text: "Building for linux64" });
                promises.push(runShellCmd("GOOS=linux go build -o bin/ ", "linbuild", log, spinnies));
            }
            if (config.targets.includes("win64")) {
                spinnies.add("winbuild", { text: "Building for win64" });
                promises.push(runShellCmd("GOOS=windows go build -o bin/ ", "winbuild", log, spinnies));
            }
            Promise.all(promises)
                .then(() => {
                log().success("Build succeeded for all targets");
                resolve();
            })
                .catch((e) => {
                handleExecError(e);
                reject(e);
            });
        }
        catch (e) {
            handleExecError(e);
            reject(e);
            return;
        }
    });
}
