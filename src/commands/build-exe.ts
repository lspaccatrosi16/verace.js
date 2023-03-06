import { execSync } from "child_process";
import { Command } from "commander";
import type { LoggerType } from "lib/log";
import buildTs from "lib/buildTs";
import { parseConfig } from "lib/parseConfig";
import { handleExecError } from "lib/common";
import buildGo from "lib/buildGo";

export default function (log: LoggerType) {
  const be = new Command("build-exe").description(
    "Builds the project according to the verace.json file"
  );

  be.action(() => build(log));

  return be;
}

const build = (log: LoggerType): Promise<void> => {
  return new Promise((resolve) => {
    parseConfig(log, "Build")
      .then((cfg) => {
        if (cfg.hooks && cfg.hooks.preBuild != "")
          execHookCommand(cfg.hooks.preBuild, log);
        switch (cfg.lang) {
          case "ts": {
            buildTs(cfg, log).then(() => {
              if (cfg.hooks && cfg.hooks.postBuild != "")
                execHookCommand(cfg.hooks.postBuild, log);
              resolve();
            });
            break;
          }

          case "go": {
            buildGo(cfg, log).then(() => {
              if (cfg.hooks && cfg.hooks.postBuild != "")
                execHookCommand(cfg.hooks.postBuild, log);
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

const execHookCommand = (cmd: string, log: LoggerType) => {
  log().info(`Executing hook: ` + cmd);
  try {
    execSync(cmd, { stdio: "inherit" });
  } catch (e) {
    log().danger("Error executing hook command: ");

    handleExecError(e, log);
  }
};
