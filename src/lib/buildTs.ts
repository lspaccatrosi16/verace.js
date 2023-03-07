import { execSync, spawnSync } from "child_process"
import fs from "fs-extra"
import { handleExecError, runShellCmd } from "lib/common"
import Spinnies from "spinnies"
import path from "path"

import veraceTempJS from "./veraceTempJS"

import type { BaseConfig } from "./veraceConfig"

const spinner = {
	interval: 50,
	frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
}
const spinnies = new Spinnies({
	spinner,
	succeedColor: "white",
})

const cleanUp = (config: BaseConfig) => {
	if (config.cleanAfterBuild && fs.existsSync("tsc-build"))
		fs.rmSync("tsc-build", { recursive: true, force: true })

	if (fs.existsSync("build"))
		fs.rmSync("build", { recursive: true, force: true })

	if (config.cleanAfterBuild && !config.skipPkg && fs.existsSync("dist"))
		fs.rmSync("dist", { recursive: true, force: true })
}
import envWrapper from "lib/executionEnvironment"

export default function (): Promise<void> {
	const env = envWrapper.getInstance()
	const { config, log } = env
	return new Promise((resolve, reject) => {
		const indexTsPath = path.join(env.wk, "src/index.ts")
		if (fs.existsSync(indexTsPath)) {
			try {
				spinnies.add("esb", { text: "1. Bundling with ESBuild" })

				if (config.produceTypes) {
					execSync(
						`cd ${env.wk} && npx tsc --declaration true --outDir tsc-build`
					)
				} else {
					execSync(
						`cd ${env.wk} && npx tsc --declaration false --outDir tsc-build`
					)
				}
				execSync(`cd ${env.wk} && npx tsc-alias -f -p tsconfig.json`)

				if (config.test != "") {
					const newCmd = `cd ${env.wk} && ${config.test}`
					const cmds = newCmd.split(" ")
					const testRes = spawnSync(cmds[0], cmds.slice(1), {
						stdio: "inherit",
						shell: true,
					})

					if (testRes.error) {
						console.log(testRes.error)
						throw new Error("Test failure")
					} else {
						console.log(testRes.output.toString().trim())

						if (testRes.status != 0) throw testRes.status
					}
				}

				execSync(
					`cd ${env.wk} && npx esbuild tsc-build/index.js --outfile="build/veraceTemp.cjs" --bundle --platform=node --target=node16`,
					{ stdio: "inherit" }
				)

				fs.writeFileSync(
					path.join(env.wk, "build/index.cjs"),
					veraceTempJS
				)

				execSync(
					`cd ${env.wk} && npx esbuild build/index.cjs --outfile="dist/${config.name}.cjs" --bundle --platform=node --target=node16`,
					{ stdio: "inherit" }
				)

				const oFile = fs
					.readFileSync(path.join(env.wk, `dist/${config.name}.cjs`))
					.toString()

				const nFile = `#!/usr/bin/env node\n` + oFile

				fs.writeFileSync(
					path.join(env.wk, `dist/${config.name}.cjs`),
					nFile
				)

				spinnies.succeed("esb")

				if (config.skipPkg) {
					resolve()
					return
				}
				try {
					const promises = []
					if (config.targets.includes("linux64")) {
						promises.push(buildLinux())
					}
					if (config.targets.includes("win64")) {
						promises.push(buildWin())
					}

					Promise.all(promises).then(() => {
						log().success("All targets built for successfully.")

						cleanUp(config)

						resolve()
						return
					})
				} catch (e) {
					throw e
				}
			} catch (e) {
				handleExecError(e, env)
				reject(e)

				cleanUp(config)

				reject(e)
			}
		} else reject(`${indexTsPath} was not found`)
		return
	})
}

const buildLinux = (): Promise<void> => {
	const env = envWrapper.getInstance()
	const { config } = env
	return new Promise((resolve, reject) => {
		spinnies.add("buildlinux", { text: "Building for linux64" })
		runShellCmd(
			`cd ${env.wk} && npx pkg "dist/${config.name}.cjs" -o bin/${config.name} -t node16-linux -C GZIP`,
			"buildlinux",
			spinnies
		)
			.then(resolve)
			.catch(reject)
	})
}

const buildWin = (): Promise<void> => {
	const env = envWrapper.getInstance()
	const { config } = env
	return new Promise((resolve, reject) => {
		spinnies.add("buildwin", { text: "Building for win64" })
		runShellCmd(
			`cd ${env.wk} && npx pkg "dist/${config.name}.cjs" -o bin/${config.name} -t node16-win -C GZIP`,
			"buildwin",
			spinnies
		)
			.then(resolve)
			.catch(reject)
	})
}
