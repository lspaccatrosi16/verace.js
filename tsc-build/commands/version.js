import { Command } from "commander";
import { writeFileSync } from "fs-extra";
import inquirer from "inquirer";
import { parseConfig } from "lib/parseConfig";
import semver from "semver";
export default function (log) {
    const v = new Command("version").description("Manage package versions");
    v.action(() => version(log));
    return v;
}
const version = (log) => {
    return new Promise((resolve, reject) => {
        parseConfig(log, "Version").then((cfg) => {
            const { version } = cfg;
            inquirer
                .prompt({
                type: "list",
                message: "Select version increment type",
                choices: [
                    "patch",
                    "minor",
                    "major",
                    "prepatch",
                    "preminor",
                    "premajor",
                ],
                name: "increment",
            })
                .then(({ increment }) => {
                const newVer = semver.inc(version, increment);
                const newConfig = { ...cfg, version: newVer };
                writeFileSync("verace.json", JSON.stringify(newConfig, null, "\t"));
            });
        });
    });
};
