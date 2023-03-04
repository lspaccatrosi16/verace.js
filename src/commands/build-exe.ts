import { execSync } from "child_process";
import { Command } from "commander";
import make_logger from "lib/log";
import buildTs from "lib/buildTs";
import { parseConfig } from "lib/parseConfig";
import { handleExecError } from "lib/common";

const log = make_logger();

export default function () {
  const be = new Command("build-exe").description(
    "Builds the project according to the rbt.json file"
  );

  be.action(build);

  return be;
}

const build = (): Promise<void> => {
  return new Promise((resolve) => {
    parseConfig(log)
      .then((cfg) => {
        console.log(cfg);
        if (cfg.hooks && cfg.hooks.preBuild)
          execHookCommand(cfg.hooks.preBuild);
        switch (cfg.lang) {
          case "ts": {
            buildTs(cfg).then(() => {
              if (cfg.hooks && cfg.hooks.postBuild)
                execHookCommand(cfg.hooks.postBuild);
              resolve();
            });
            break;
          }

          case "go": {
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

const execHookCommand = (cmd: string) => {
  log().info(`Executing hook: ` + cmd);
  try {
    execSync(cmd, { stdio: "ignore" });
  } catch (e) {
    log().danger("Error executing hook command: ");

    handleExecError(e);
  }
};
