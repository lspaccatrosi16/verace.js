import { execSync } from "child_process";
import { Command } from "commander";
import make_logger from "lib/log";
import buildTs from "lib/buildTs";
import { parseConfig } from "lib/parseConfig";
import { handleExecError } from "lib/common";
import "lib/buildGo";
const log = make_logger();
export default function () {
    const re = new Command("run-exe").description("Runs the current project");
    re.argument("[options...]");
    re.action((args) => run(args));
    return re;
}
const run = (args) => {
    return new Promise((resolve, reject) => {
        parseConfig(log, "Run").then((cfg) => {
            try {
                switch (cfg.lang) {
                    case "go":
                        log(`\n\nRun Start:`);
                        execSync(`go run main.go ${args.join(" ")}`, { stdio: "inherit" });
                        log().success("Run End");
                        resolve();
                        break;
                    case "ts":
                        buildTs({ ...cfg, skipPkg: true });
                        log(`\n\nRun Start:`);
                        execSync(`node dist/${cfg.name}.cjs ${args.join(" ")}`, {
                            stdio: "inherit",
                        });
                        log().success("Run End");
                        resolve();
                        break;
                }
            }
            catch (e) {
                handleExecError(e);
                reject(e);
                return;
            }
        });
    });
};
