import { execSync } from "child_process";
import { runShellCmd, handleExecError } from "lib/common";
import make_logger from "lib/log";
import { existsSync, rmSync, writeFileSync } from "fs-extra";
import Spinnies from "spinnies";

import type { BaseConfig } from "./types";
import fingoTempJS from "./fingoTempJS";

const log = make_logger();

const spinner = {
	interval: 50,
	frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
};
const spinnies = new Spinnies({
	spinner,
	succeedColor: "white",
});

export default function (config: BaseConfig): Promise<void> {
	return new Promise((resolve, reject) => {
		if (existsSync("src/index.ts")) {
			try {
				spinnies.add("esb", { text: "1. Bundling with ESBuild" });

				execSync(
					`npx esbuild src/index.ts --outfile="build/fingoTemp.cjs" --bundle --platform=node --target=node14 && npx tsc --emitDeclarationOnly`,
					{ stdio: "inherit" }
				);

				writeFileSync("build/index.cjs", fingoTempJS);

				execSync(
					`npx esbuild build/index.cjs --outfile="dist/${config.name}.cjs" --bundle --platform=node --target=node14`,
					{ stdio: "inherit" }
				);

				rmSync("build", { recursive: true, force: true });

				spinnies.succeed("esb");

				if (config.skipPkg) {
					resolve();
					return;
				}
				try {
					const promises = [];
					if (config.targets.includes("linux64")) {
						promises.push(buildLinux(config));
					}
					if (config.targets.includes("win64")) {
						promises.push(buildWin(config));
					}

					Promise.all(promises).then(() => {
						log().success("All targets built for successfully.");
						resolve();
						return;
					});
				} catch (e) {
					handleExecError(e);
					reject(e);
					return;
				}
			} catch (e) {
				handleExecError(e);
				reject(e);
				return;
			}
		} else reject("src/index.ts was not found");
		return;
	});
}

const buildLinux = (config: BaseConfig): Promise<void> => {
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

const buildWin = (config: BaseConfig): Promise<void> => {
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
