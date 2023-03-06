import { execSync } from "child_process";
import { Command } from "commander";
import buildTs from "lib/buildTs";
import { parseConfig } from "lib/parseConfig";
import { handleExecError } from "lib/common";
import { ExecutionEnvironment } from "lib/executionEnvironment";

export default function (env: ExecutionEnvironment) {
	const re = new Command("run-exe").description("Runs the current project");
	re.argument("[options...]");
	re.action((args: string[]) => run(args, env));

	return re;
}

const run = (args: string[], env: ExecutionEnvironment): Promise<void> => {
	const { log } = env;
	return new Promise((resolve, reject) => {
		parseConfig(env, "Run").then((cfg) => {
			env.setConfig(cfg);
			try {
				switch (cfg.lang) {
					case "go":
						log(`\n\nRun Start:`);
						execSync(`go run main.go ${args.join(" ")}`, { stdio: "inherit" });
						log().success("Run End");
						resolve();
						break;
					case "ts":
						const runEnv = new ExecutionEnvironment(false, env.apiMode);
						runEnv.setConfig({ ...cfg, skipPkg: true });
						runEnv.setApiExecutionConfig(env.apiExecutionConfig);

						buildTs(runEnv);

						log(`\n\nRun Start:`);
						execSync(`node dist/${cfg.name}.cjs ${args.join(" ")}`, {
							stdio: "inherit",
						});
						log().success("Run End");
						resolve();
						break;
				}
			} catch (e) {
				handleExecError(e, env);
				reject(e);
				return;
			}
		});
	});
};
