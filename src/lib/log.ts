import chalk from "chalk"

import type { BaseConfig } from "./veraceConfig"

interface Opts {
	color: string
	bold: boolean
	underline: boolean
}

export type uncalledFn = [Logger, string]

export type LoggerType = (str?: string) => Logger

export function make_logger(testMode = false, apiMode = false) {
	const log = new Logger(testMode, apiMode)

	return (str?: string) => {
		if (str) {
			return log.apply(str)
		} else return log
	}
}

let devBuffer = ""

class Logger {
	private _color: string = "#FFFFFF"
	private _bold: boolean = false
	private _underline: boolean = false
	maxWidth: 75
	private testMode: boolean
	private apiMode: boolean

	constructor(testMode: boolean, apiMode: boolean, opts?: Opts) {
		this.testMode = testMode
		this.apiMode = apiMode

		if (opts) {
			this._color = opts.color
			this._bold = opts.bold
			this._underline = opts.underline
		}
	}

	apply(str: string) {
		return this._self()._log(str)
	}

	private _self(opts = {}, print = false) {
		const newOpts: Opts = {
			...{
				color: this._color,
				bold: this._bold,
				underline: this._underline,
			},
			...opts,
		}

		// if (!print) console.log("self", this, opts, newOpts);

		return new Logger(this.testMode, this.apiMode, newOpts)
	}

	citrus(str?: string) {
		const newAttr = { color: "F7FF00" }
		if (!str) return this._self(newAttr)
		else {
			this._self(newAttr)._log(str)
		}
	}

	grey(str?: string) {
		const newAttr = { color: "aaaaaa" }
		if (!str) return this._self(newAttr)
		else {
			this._self(newAttr)._log(str)
		}
	}

	bold(str?: string) {
		const newAttr = { bold: true }
		if (!str) return this._self(newAttr)
		else {
			this._self(newAttr)._log(str)
		}
	}

	underline(str?: string) {
		const newAttr = { underline: true }
		if (!str) return this._self(newAttr)
		else {
			this._self(newAttr)._log(str)
		}
	}

	danger(str?: string) {
		const newAttr = { bold: true, color: "#eb445a" }
		if (!str) return this._self(newAttr)
		else {
			this._self(newAttr)._log(str)
		}
	}

	warn(str?: string) {
		const newAttr = { color: "#ff8709" }
		if (!str) return this._self(newAttr)
		else {
			this._self(newAttr)._log(str)
		}
	}

	info(str?: string) {
		const newAttr = { color: "#23a8f2" }
		if (!str) return this._self(newAttr)
		else {
			this._self(newAttr)._log(str)
		}
	}

	success(str?: string) {
		const newAttr = { color: "#2dd36f" }
		if (!str) return this._self(newAttr)
		else {
			this._self(newAttr)._log(str)
		}
	}

	get context() {
		return this
	}

	private _logTree(str: string): string {
		if (this._bold) {
			if (this._underline)
				return chalk.bold.underline.hex(this._color)(str)
			else return chalk.bold.hex(this._color)(str)
		} else if (this._underline) return chalk.underline.hex(this._color)(str)
		else return chalk.hex(this._color)(str)
	}

	private _log(str: string) {
		const logOutput = this._logTree(this.sanitiseString(str) + "\n")

		this.StdoutWrite(logOutput)

		return this._self({}, true)
	}

	private sanitiseString(str: string): string {
		const maxW = 100
		const newString: string[] = []

		let newStr = ""
		if (str) newStr = str.toString()

		const splitStr = newStr.split("\n")

		splitStr.forEach(el => {
			// console.log("len:", el.length);
			if (el.length > maxW && !this.testMode) {
				// console.log("len > max");
				newString.push(
					[
						el.slice(0, maxW),
						"\n",
						this.sanitiseString(el.slice(maxW)),
					].join("")
				)
			} else {
				newString.push(el)
			}
		})

		let outstr = newString.join("\n")
		// if (newString.length != 1 && !multi) outstr = outstr.trimEnd();

		return outstr
	}

	multi(parts: uncalledFn[]) {
		let outstr = ""
		parts.forEach(el => {
			const fn = el[0]
			const str = el[1]

			// console.log("fnres:", fn);
			outstr += fn._logTree(this.sanitiseString(str))
		})

		outstr += "\n"

		return this.StdoutWrite(outstr)
	}

	get dumpBuffer() {
		if (this.testMode) return devBuffer
		else return null
	}

	private StdoutWrite(data: string) {
		if (!this.testMode && !this.apiMode) {
			process.stdout.write(data)
		} else {
			devBuffer += data
			return data
		}
	}

	get apiStatus() {
		return this.apiMode
	}
}
