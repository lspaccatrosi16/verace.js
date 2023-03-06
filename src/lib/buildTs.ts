import { execSync, spawnSync } from "child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "fs-extra";
import { handleExecError, runShellCmd } from "lib/common";
import Spinnies from "spinnies";

import veraceTempJS from "./veraceTempJS";

import type { BaseConfig } from "./veraceConfig";
import type { LoggerType } from "./log";

const spinner = {
  interval: 50,
  frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
};
const spinnies = new Spinnies({
  spinner,
  succeedColor: "white",
});

const cleanUp = (config: BaseConfig) => {
  if (config.cleanAfterBuild && existsSync("tsc-build"))
    rmSync("tsc-build", { recursive: true, force: true });

  if (existsSync("build")) rmSync("build", { recursive: true, force: true });

  if (config.cleanAfterBuild && !config.skipPkg && existsSync("dist"))
    rmSync("dist", { recursive: true, force: true });
};

export default function (config: BaseConfig, log: LoggerType): Promise<void> {
  return new Promise((resolve, reject) => {
    if (existsSync("src/index.ts")) {
      try {
        spinnies.add("esb", { text: "1. Bundling with ESBuild" });

        if (config.produceTypes) {
          execSync(`npx tsc --declaration true --outDir tsc-build`);
        } else {
          execSync(`npx tsc --declaration false --outDir tsc-build`);
        }
        execSync(`npx ts-add-js-extension add --dir=tsc-build`);

        if (config.test != "") {
          const cmds = config.test.split(" ");
          const testRes = spawnSync(cmds[0], cmds.slice(1), {
            stdio: "inherit",
          });

          if (testRes.error) {
            console.log(testRes.error);
            process.exit(1);
          } else {
            console.log(testRes.output.toString());

            if (testRes.status != 0) throw testRes.status;
          }
        }

        execSync(
          `npx esbuild tsc-build/index.js --outfile="build/veraceTemp.cjs" --bundle --platform=node --target=node16`,
          { stdio: "inherit" }
        );

        writeFileSync("build/index.cjs", veraceTempJS);

        execSync(
          `npx esbuild build/index.cjs --outfile="dist/${config.name}.cjs" --bundle --platform=node --target=node16`,
          { stdio: "inherit" }
        );

        const oFile = readFileSync(`dist/${config.name}.cjs`).toString();

        const nFile = `#!/usr/bin/env node\n` + oFile;

        writeFileSync(`dist/${config.name}.cjs`, nFile);

        spinnies.succeed("esb");

        if (config.skipPkg) {
          resolve();
          return;
        }
        try {
          const promises = [];
          if (config.targets.includes("linux64")) {
            promises.push(buildLinux(config, log));
          }
          if (config.targets.includes("win64")) {
            promises.push(buildWin(config, log));
          }

          Promise.all(promises).then(() => {
            log().success("All targets built for successfully.");

            cleanUp(config);

            resolve();
            return;
          });
        } catch (e) {
          throw e;
        }
      } catch (e) {
        handleExecError(e, log);
        reject(e);

        cleanUp(config);

        process.exit(1);
      }
    } else reject("src/index.ts was not found");
    return;
  });
}

const buildLinux = (config: BaseConfig, log: LoggerType): Promise<void> => {
  return new Promise((resolve, reject) => {
    spinnies.add("buildlinux", { text: "Building for linux64" });
    runShellCmd(
      `npx pkg "dist/${config.name}.cjs" -o bin/${config.name} -t node16-linux -C GZIP`,
      "buildlinux",
      log,
      spinnies
    )
      .then(resolve)
      .catch(reject);
  });
};

const buildWin = (config: BaseConfig, log: LoggerType): Promise<void> => {
  return new Promise((resolve, reject) => {
    spinnies.add("buildwin", { text: "Building for win64" });
    runShellCmd(
      `npx pkg "dist/${config.name}.cjs" -o bin/${config.name} -t node16-win -C GZIP`,
      "buildwin",
      log,
      spinnies
    )
      .then(resolve)
      .catch(reject);
  });
};
