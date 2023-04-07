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

import { execSync } from "child_process";
import { Command } from "commander";
import buildTs from "lib/buildTs";
import { handleExecError } from "lib/common";
import envWrapper from "lib/executionEnvironment";
import { parseConfig } from "lib/parseConfig";
import zodWrapper from "lib/zodParserWithResult";
import rustic from "rustic";
import z from "zod";

export default function () {
	const re = new Command("run-exe").description("Runs the current project");
	re.alias("run");
	re.argument("[arguments...]");

	re.action((args: string[]) => {
		return run(args);
	});
	return re;
}

const runApiParser = z.array(z.string());

export type RunApi = z.infer<typeof runApiParser>;

export async function runApi(
	args: unknown
): Promise<rustic.Result<null, string>> {
	const argsResult = zodWrapper(runApiParser, args);

	if (argsResult.isErr()) {
		return rustic.Err(argsResult.unwrapErr());
	}

	const parsedArgs = argsResult.unwrap();

	try {
		await run(parsedArgs);

		return rustic.Ok(null);
	} catch (e) {
		return rustic.Err(e);
	}
}

const run = (args: string[]): Promise<void> => {
	const env = envWrapper.getInstance();
	const { log } = env;
	return new Promise((resolve, reject) => {
		parseConfig("Run").then(() => {
			const { config: cfg } = env;
			try {
				switch (cfg.lang) {
					case "go":
						log(`\n\nRun Start:`);
						execSync(
							`cd ${env.wk} && go run ${
								env.entryPointPath
							} ${args.join(" ")}`,
							{
								stdio: "inherit",
							}
						);
						log().success("Run End");
						resolve();
						break;
					case "ts":
						env.setConfig({
							...cfg,
							ts: { ...cfg.ts, skipPkg: true },
						});

						buildTs();

						log(`\n\nRun Start:`);
						execSync(
							`cd ${env.wk} && node dist/${
								cfg.name
							}.cjs ${args.join(" ")}`,
							{
								stdio: "inherit",
							}
						);
						log().success("Run End");
						resolve();
						break;
				}
			} catch (e) {
				handleExecError(e, env);
				reject();
				return;
			}
		});
	});
};
