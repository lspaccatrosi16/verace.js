import { Command } from "commander";
import buildExe from "commands/build-exe";
import createExe from "commands/create-exe";
import runExe from "commands/run-exe";
import version from "commands/version";
import figlet from "figlet";
import Standard from "font/Standard";
import { ExecutionEnvironment } from "lib/executionEnvironment";

import type { APIResult, Commands } from "lib/log";
import type { VeraceEnv } from "index";
process.on("exit", (code) => {
	console.log("\n");
	if (code == 0) console.log("Verace.js CLI exited without errors.");
	else console.log("Verace.js CLI exited with errors.");
});

const init = async (version: string, env: ExecutionEnvironment) => {
	const { log } = env;
	log("\u2500".repeat(80));

	figlet.parseFont("Standard", Standard);
	const veracejs = figlet.textSync("verace.js", {
		font: "Standard",
		horizontalLayout: "fitted",
	});

	log().citrus(veracejs);
	log().bold().citrus("The multi-platform, multi-language build tool");

	log(`v${version}`);
};

export default function (env: VeraceEnv) {
	const executionEnvironment = new ExecutionEnvironment(false, false);

	init(env.version, executionEnvironment).then(() => {
		const program = createProgram(executionEnvironment, env);
		program.parseAsync(process.argv);
	});
}

export interface APICONFIG {
	command: Commands;
	path: string;
}

export function api(config: APICONFIG, testMode: boolean): Promise<APIResult> {
	return new Promise((resolve, reject) => {
		const env = new ExecutionEnvironment(testMode, true);
		env.setApiExecutionConfig(config);

		const program = createProgram(env);

		const { log } = env;

		if (config.command != "build-exe") {
			log().danger("Only command build-exe is currently supported");

			process.exit(1);
		}

		program.parseAsync(["", "", config.command]).then(() => {
			resolve(log().apiExecResult);
		});
	});
}

function createProgram(execEnv: ExecutionEnvironment, env?: VeraceEnv): Command {
	const program = new Command();

	const { log } = execEnv;

	if (env) {
		program.name(env.name).description("The Verace.js CLI Toolchain").version(env.version);
		program.action(async () => {
			log(program.helpInformation());
		});
		program
			.command("help")
			.description("Shows this message")
			.action(async () => {
				log(program.helpInformation());
			});
	}

	program.addCommand(createExe(execEnv));
	program.addCommand(buildExe(execEnv));
	program.addCommand(runExe(execEnv));
	program.addCommand(version(execEnv));

	return program;
}
