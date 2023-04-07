/*
Copyright (C) 2023  Luca Spaccatrosi

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/

import { Command } from "commander";
import buildExe from "commands/build-exe";
import createExe from "commands/create-exe";
import runExe from "commands/run-exe";
import version from "commands/version";
import figlet from "figlet";
import Standard from "font/Standard";
import executionEnv from "lib/executionEnvironment";

import rustic from "rustic";
import type { Result } from "rustic";
const { isOk, Ok } = rustic;

import type {
	APIResult,
	Commands,
	ExecutionEnvironment,
} from "lib/executionEnvironment";
import type { VeraceEnv } from "index";

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

	log().verbose().grey("Verbose mode enabled");
};

export default function (env: VeraceEnv) {
	if (process.argv[2] == "thisver") {
		console.log(env.version);
		process.exit(0);
	}

	process.on("exit", code => {
		console.log("\n");
		if (code == 0) console.log("Verace.js CLI exited without errors.");
		else {
			const env = executionEnv.getInstance();
			if (env) {
				const { log } = env;
				log("Environment Config: ");
				log(env.ErrorExecContext);
			}
			console.log("Verace.js CLI exited with errors.");
		}
	});

	const topProgram = createPrimaryProgram(false, false, env);

	if (!isOk(topProgram)) {
		throw topProgram.data;
	}

	topProgram.data.parseAsync(process.argv).then(() => {
		const executionEnvironment = executionEnv.getInstance();
		const { log } = executionEnvironment;
		init(env.version, executionEnvironment).then(() => {
			const program = createMainProgram(env);
			program
				.parseAsync(process.argv)
				.then(() => {
					executionEnv.purge();
				})
				.catch(e => {
					if (e) log().danger(e.toString());
					process.exit(1);
				});
		});
	});
}

export interface APICONFIG {
	command: Commands;
	path: string;
	verbose: boolean;
}

export function api(config: APICONFIG, testMode: boolean): Promise<APIResult> {
	return new Promise((resolve, reject) => {
		let primDummyArgv = ["", "", "--path", config.path];
		if (config.verbose) {
			primDummyArgv.push("--verbose");
		}
		const topProg = createPrimaryProgram(testMode, true);

		if (!isOk(topProg)) {
			reject(topProg.data);
			return;
		}

		topProg.data
			.parseAsync(primDummyArgv)
			.then(() => {
				const env = executionEnv.getInstance();
				const program = createMainProgram();
				if (config.command != "build-exe") {
					throw new Error(
						"Only command build-exe is currently supported"
					);
				}

				program
					.parseAsync(["", "", config.command])
					.then(() => {
						const execData = { ...env.apiExecResult };
						console.log(execData);
						executionEnv.purge();
						resolve(execData);
					})
					.catch(() => {
						const { log } = env;
						log("Env config:");
						log(env.ErrorExecContext);

						reject();
					});
			})
			.catch(reject);
	});
}

function createPrimaryProgram(
	testMode: boolean,
	apiMode: boolean,
	env?: VeraceEnv
): Result<Command, string> {
	const topProgram = new Command();
	if (env) {
		topProgram
			.name(env.name)
			.description("The Verace.js CLI Toolchain")
			.version(env.version);
	}

	topProgram.option("-p --path <path>", "Path to verace.json file.");
	topProgram.option("-v --verbose", "Provides verbose logs");
	topProgram.allowUnknownOption();

	topProgram.action(async () => {
		const opts = topProgram.optsWithGlobals();
		let verbose = false;

		if (opts.verbose) {
			verbose = true;
		}
		const env = executionEnv.getInstance();
		const res = env.setupInstance(testMode, apiMode, verbose);
		if (!isOk(res)) {
			throw res.data;
		}

		if (opts.path && opts.path != "") {
			env.setConfigPath(opts.path);
		}

		return;
	});

	return Ok(topProgram);
}

function createMainProgram(env?: VeraceEnv): Command {
	const program = new Command();

	if (env) {
		program
			.name(env.name)
			.description("The Verace.js CLI Toolchain")
			.version(env.version);
		program.action(async () => {
			console.log(program.helpInformation());
		});
		program
			.command("help")
			.description("Shows this message")
			.action(async () => {
				console.log(program.helpInformation());
			});
	}

	program.option("-p --path <path>", "Path to verace.json file.");
	program.option("-v --verbose", "Provides verbose logs");

	program.addCommand(createExe());
	program.addCommand(buildExe());
	program.addCommand(runExe());
	program.addCommand(version());

	return program;
}
