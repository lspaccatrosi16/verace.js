import { execSync } from "child_process";
import { Command } from "commander";
import make_logger from "lib/log";
import buildTs from "lib/buildTs";
import { parseConfig } from "lib/parseConfig";
import { handleExecError } from "lib/common";
import buildGo from "lib/buildGo";
const log = make_logger();
export default function () {
    const be = new Command("build-exe").description("Builds the project according to the verace.json file");
    be.action(build);
    return be;
}
const build = () => {
    return new Promise((resolve) => {
        parseConfig(log, "Build")
            .then((cfg) => {
            if (cfg.hooks && cfg.hooks.preBuild != "")
                execHookCommand(cfg.hooks.preBuild);
            switch (cfg.lang) {
                case "ts": {
                    buildTs(cfg).then(() => {
                        if (cfg.hooks && cfg.hooks.postBuild != "")
                            execHookCommand(cfg.hooks.postBuild);
                        resolve();
                    });
                    break;
                }
                case "go": {
                    buildGo(cfg).then(() => {
                        if (cfg.hooks && cfg.hooks.postBuild != "")
                            execHookCommand(cfg.hooks.postBuild);
                        resolve();
                    });
                    break;
                }
            }
        })
            .catch((e) => {
            log().danger(e);
            process.exit(1);
        });
    });
};
const execHookCommand = (cmd) => {
    log().info(`Executing hook: ` + cmd);
    try {
        execSync(cmd, { stdio: "inherit" });
    }
    catch (e) {
        log().danger("Error executing hook command: ");
        handleExecError(e);
    }
};
