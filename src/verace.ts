import { Command } from "commander";
import Logger, { LoggerType } from "lib/log";
import figlet from "figlet";
import Standard from "font/Standard";
import inquirer from "inquirer";
import iqr from "inquirer-command-prompt";
import createExe from "commands/create-exe";
import buildExe from "commands/build-exe";
import runExe from "commands/run-exe";
import type { VeraceEnv as VeraceEnv } from "index";
import version from "commands/version";

inquirer.registerPrompt("command", iqr);

const program = new Command();

process.on("exit", (code) => {
  console.log("\n");
  if (code == 0) console.log("Verace.js CLI exited without errors.");
  else console.log("Verace.js CLI exited with errors.");
});

const init = async (version: string, log: LoggerType) => {
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
  const log = Logger();

  init(env.version, log).then(() => {
    program
      .name(env.name)
      .description("The Verace.js CLI Toolchain")
      .version(env.version);
    program.action(async () => {
      log(program.helpInformation());
    });

    program.addCommand(createExe(log));
    program.addCommand(buildExe(log));
    program.addCommand(runExe(log));
    program.addCommand(version(log));

    program
      .command("help")
      .description("Shows this message")
      .action(async () => {
        log(program.helpInformation());
      });
    program.parseAsync(process.argv);
  });
}
