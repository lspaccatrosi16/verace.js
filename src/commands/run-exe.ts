import { execSync } from "child_process"
import { Command } from "commander"
import buildTs from "lib/buildTs"
import { parseConfig } from "lib/parseConfig"
import { handleExecError } from "lib/common"

import envWrapper from "lib/executionEnvironment"

export default function () {
	const re = new Command("run-exe").description("Runs the current project")
	re.argument("[options...]")
	re.action((args: string[]) => run(args))

	return re
}

const run = (args: string[]): Promise<void> => {
	const env = envWrapper.getInstance()
	const { log } = env
	return new Promise((resolve, reject) => {
		parseConfig("Run").then(cfg => {
			env.setConfig(cfg)
			try {
				switch (cfg.lang) {
					case "go":
						log(`\n\nRun Start:`)
						execSync(`go run main.go ${args.join(" ")}`, {
							stdio: "inherit",
						})
						log().success("Run End")
						resolve()
						break
					case "ts":
						env.setConfig({ ...cfg, skipPkg: true })

						buildTs()

						log(`\n\nRun Start:`)
						execSync(
							`node dist/${cfg.name}.cjs ${args.join(" ")}`,
							{
								stdio: "inherit",
							}
						)
						log().success("Run End")
						resolve()
						break
				}
			} catch (e) {
				handleExecError(e, env)
				reject(e)
				return
			}
		})
	})
}
