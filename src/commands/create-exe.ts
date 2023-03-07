import child_process from "child_process"
import { Command } from "commander"
import fs from "fs-extra"
import inquirer from "inquirer"
import {
	baseconfig,
	goFile,
	goGI,
	makePackageJson,
	tsConfig,
	tsFile,
	tsGI,
} from "lib/baseConfig"
import envWrapper from "lib/executionEnvironment"

import type { BaseConfig } from "lib/veraceConfig"

export default function () {
	const ce = new Command("create-exe").description("Creates an executable.")
	ce.action(() => collectInfo())
	return ce
}

const errorDeleteFile = (files: string[]): Promise<void> => {
	return new Promise(resolve => {
		files.forEach(file => {
			if (fs.existsSync(file))
				fs.rmSync(file, { force: true, recursive: true })
		})

		resolve()
	})
}

const collectInfo = async () => {
	const env = envWrapper.getInstance()
	const { log } = env
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
			name: "gomod",
			when: answers => {
				return answers.lang && answers.lang == "go"
			},
		},
	])

	const userSelection: BaseConfig = { ...baseconfig, ...answers }

	switch (userSelection.lang) {
		case "go": {
			try {
				child_process.execSync("go version")
				child_process.execSync(`go mod init ${userSelection.gomod}`)

				await fs.writeFile("main.go", goFile)
				await fs.writeFile(".gitignore", goGI)
				log().success("Successfully initialised the Go project")
			} catch {
				log().danger(
					"Go binary could not be found on the current system."
				)

				await errorDeleteFile(["go.mod", "main.go", ".gitignore"])

				return
			}
			break
		}

		case "ts": {
			try {
				const pkg = makePackageJson(userSelection)
				await fs.writeFile(
					"package.json",
					JSON.stringify(pkg, null, "\t")
				)
				await fs.writeFile(
					"tsconfig.json",
					JSON.stringify(tsConfig, null, "\t")
				)

				await child_process.execSync("npm i")
				await fs.mkdir("src")
				await fs.writeFile("src/index.ts", tsFile)
				await fs.writeFile(".gitignore", tsGI)

				await log().success(
					"Successfully initialised the Typescript project"
				)
			} catch (e) {
				if (e) log().danger(e.toString())

				await errorDeleteFile([
					"tsconfig.json",
					"package.json",
					"src",
					".gitignore",
					"node_modules",
					"package-lock.json",
				])

				return
			}
			break
		}
	}

	await fs.writeFile("verace.json", JSON.stringify(userSelection, null, "\t"))

	return
}
