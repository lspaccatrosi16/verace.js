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

import child_process from "child_process";
import { Command } from "commander";
import fs from "fs-extra";
import inquirer from "inquirer";
import {
	baseconfig,
	goFile,
	goGI,
	makePackageJson,
	makeVeraceConfig,
	tsConfig,
	tsFile,
	tsGI,
} from "lib/baseConfig";
import envWrapper from "lib/executionEnvironment";

import path from "path";

import rustic from "rustic";
import type { Result } from "rustic";
const { Ok, Err } = rustic;

import type { BaseConfig } from "lib/veraceConfig";
import { z } from "zod";
import zodWrapper from "src/lib/zodParserWithResult";

export default function () {
	const env = envWrapper.getInstance();
	const ce = new Command("create-exe").description("Creates an executable.");
	ce.alias("create");
	ce.action(() => {
		const opts = ce.optsWithGlobals();

		let dirPath = "";

		if (opts.path && opts.path != "") {
			const input = opts.path as string;
			if (fs.existsSync(input)) {
				if (fs.lstatSync(input).isFile()) {
					dirPath = path.dirname(input);
				} else {
					dirPath = input;
				}
			} else {
				if (input.endsWith(".json") || input.endsWith(".mjs")) {
					dirPath = path.dirname(input);
					fs.mkdirSync(dirPath, { recursive: true });
				} else {
					fs.mkdirSync(input, { recursive: true });
					dirPath = input;
				}
			}

			const newPath = path.join(dirPath, "verace.config.js");

			env.setConfigPath(newPath);
		}
		return collectInfo();
	});
	return ce;
}

const errorDeleteFile = (files: string[]): Promise<void> => {
	return new Promise(resolve => {
		files.forEach(file => {
			if (fs.existsSync(file))
				fs.rmSync(file, { force: true, recursive: true });
		});

		resolve();
	});
};

const collectInfo = async () => {
	const env = envWrapper.getInstance();
	const { log } = env;
	const answers = await inquirer.prompt([
		{
			name: "lang",
			type: "list",
			message: "Select an executable language",
			choices: [
				{ name: "Go", value: "go" },
				{ name: "Typescript", value: "ts" },
			],
		},
		{
			name: "name",
			message: "Enter package name",
			type: "input",
		},
		{
			type: "input",
			message: "Enter go module path",
			name: "go.gomod",
			when: answers => {
				return answers.lang && answers.lang == "go";
			},
		},
	]);

	const userSelection: BaseConfig = { ...baseconfig, ...answers };

	if (userSelection.lang == "ts") {
		delete userSelection.go;
	} else if (userSelection.lang == "go") {
		delete userSelection.ts;
	}

	console.log(
		`Will create a project in ${path.dirname(
			env.resolveFromRoot("verace.config.js")
		)} with config:\n\n`
	);
	console.log(userSelection, "\n\n");

	const { confirm } = await inquirer.prompt({
		type: "list",
		choices: ["yes", "no"],
		name: "confirm",
		message: "Confirm creation?",
	});

	if (confirm != "yes") {
		log().danger("Creation cancelled");
		return;
	}

	doCreation(userSelection);
	return;
};

const createApiParser = z
	.object({
		lang: z.union([z.literal("ts"), z.literal("go")]),
		name: z.string(),
		gomod: z.optional(z.string()),
	})
	.strict();

export type CreateApi = z.infer<typeof createApiParser>;

export async function createApi(
	config: unknown
): Promise<Result<null, string>> {
	const parsedConfig = zodWrapper(createApiParser, config);

	if (parsedConfig.isErr()) {
		return Err(parsedConfig.unwrapErr());
	}
	const userSelection: BaseConfig = {
		...baseconfig,
		...parsedConfig.unwrap(),
	};

	if (userSelection.lang == "ts") {
		delete userSelection.go;
	} else if (userSelection.lang == "go") {
		delete userSelection.ts;
	}

	try {
		await doCreation(config);
		return Ok(null);
	} catch (e) {
		return Err(e);
	}
}

async function doCreation(userSelection: BaseConfig) {
	const env = envWrapper.getInstance();
	const { log } = env;
	switch (userSelection.lang) {
		case "go": {
			try {
				child_process.execSync("go version");
				child_process.execSync(
					`cd ${env.wk} && go mod init ${userSelection.go.gomod}`
				);

				await fs.writeFile(env.resolveFromRoot("main.go"), goFile);
				await fs.writeFile(env.resolveFromRoot(".gitignore"), goGI);

				await fs.writeFile(
					env.resolveFromRoot("verace.json"),
					JSON.stringify(userSelection, null, "\t")
				);

				log().success("Successfully initialised the Go project");
			} catch (e) {
				log().danger(
					"Go binary could not be found on the current system."
				);

				await errorDeleteFile(["go.mod", "main.go", ".gitignore"]);

				throw e;
			}
			break;
		}

		case "ts": {
			try {
				const pkg = makePackageJson(userSelection);
				await fs.writeFile(
					env.resolveFromRoot("package.json"),
					JSON.stringify(pkg, null, "\t")
				);
				await fs.writeFile(
					env.resolveFromRoot("tsconfig.json"),
					JSON.stringify(tsConfig, null, "\t")
				);

				await child_process.execSync("npm i");
				await fs.mkdir(env.resolveFromRoot("src"), { recursive: true });
				await fs.writeFile(env.resolveFromRoot("src/index.ts"), tsFile);
				await fs.writeFile(env.resolveFromRoot(".gitignore"), tsGI);

				await fs.writeFile(
					env.resolveFromRoot("verace.config.js"),
					makeVeraceConfig(userSelection)
				);

				await log().success(
					"Successfully initialised the Typescript project"
				);
			} catch (e) {
				if (e) log().danger(e.toString());

				await errorDeleteFile([
					"tsconfig.json",
					"package.json",
					"src",
					".gitignore",
					"node_modules",
					"package-lock.json",
				]);

				throw e;
			}
			break;
		}
	}
}
