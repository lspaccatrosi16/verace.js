import { Command } from "commander";
import Logger from "lib/log";
import figlet from "figlet";
import Standard from "font/Standard";
import inquirer from "inquirer";
import iqr from "inquirer-command-prompt";
import createExe from "commands/create-exe";
import buildExe from "commands/build-exe";
import runExe from "commands/run-exe";
import type { FingoEnv } from "index";

inquirer.registerPrompt("command", iqr);

const program = new Command();

const log = Logger();
process.on("exit", (code) => {
	log("\n");
	if (code == 0) log().success("Fingo CLI exited without errors.");
	else log().danger("Fingo CLI exited with errors.");
});

const init = async (version: string) => {
	log("\u2500".repeat(80));

	figlet.parseFont("Standard", Standard);
	const fingojs = figlet.textSync("fingo.js", {
		font: "Standard",
		verticalLayout: "full",
	});

	log().citrus(fingojs);
	log().bold().citrus("The multi-platform multi-language build tool");

	log(`v${version}`);

	if (process.argv[2] == "version") {
		process.exit(0);
	}
};

export default function (env: FingoEnv) {
	init(env.version).then(() => {
		program.name(env.name).description("The fingo CLI Toolchain").version(env.version);
		program.action(async () => {
			log(program.helpInformation());
		});

		program.addCommand(createExe());
		program.addCommand(buildExe());
		program.addCommand(runExe());

		program
			.command("help")
			.description("Shows this message")
			.action(async () => {
				log(program.helpInformation());
			});
		program.parseAsync(process.argv);
	});
}
