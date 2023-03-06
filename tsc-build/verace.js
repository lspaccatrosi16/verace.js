import { Command } from "commander";
import Logger from "lib/log";
import figlet from "figlet";
import Standard from "font/Standard";
import inquirer from "inquirer";
import iqr from "inquirer-command-prompt";
import createExe from "commands/create-exe";
import buildExe from "commands/build-exe";
import runExe from "commands/run-exe";
import version from "commands/version";
inquirer.registerPrompt("command", iqr);
const program = new Command();
const log = Logger();
process.on("exit", (code) => {
    log("\n");
    if (code == 0)
        log().success("Verace.js CLI exited without errors.");
    else
        log().danger("Verace.js CLI exited with errors.");
});
const init = async (version) => {
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
export default function (env) {
    init(env.version).then(() => {
        program.name(env.name).description("The Verace.js CLI Toolchain").version(env.version);
        program.action(async () => {
            log(program.helpInformation());
        });
        program.addCommand(createExe());
        program.addCommand(buildExe());
        program.addCommand(runExe());
        program.addCommand(version());
        program
            .command("help")
            .description("Shows this message")
            .action(async () => {
            log(program.helpInformation());
        });
        program.parseAsync(process.argv);
    });
}
