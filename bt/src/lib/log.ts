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

import chalk from "chalk";

import util from "util";

interface Opts {
	color: string;
	bold: boolean;
	underline: boolean;
	verbose: boolean;
}

export type uncalledFn = [Logger, string];

export type LoggerType = (input?: string | object) => Logger;

export function make_logger(
	testMode = false,
	apiMode = false,
	verboseMode = false
) {
	const log = new Logger(testMode, apiMode, verboseMode);
	return (input?: string | object) => {
		if (input) {
			return log.apply(input);
		} else return log;
	};
}

let devBuffer = "";

class Logger {
	private _color: string = "#FFFFFF";
	private _bold: boolean = false;
	private _underline: boolean = false;
	private _verbose: boolean = false;
	maxWidth: 75;
	private testMode: boolean;
	private apiMode: boolean;
	private verboseMode: boolean;

	constructor(
		testMode: boolean,
		apiMode: boolean,
		verboseMode: boolean,
		opts?: Opts
	) {
		this.testMode = testMode;
		this.apiMode = apiMode;
		this.verboseMode = verboseMode;

		if (opts) {
			this._color = opts.color;
			this._bold = opts.bold;
			this._underline = opts.underline;
			this._verbose = opts.verbose;
		}
	}

	apply(input: string | object) {
		return this._self()._log(input);
	}

	private _self(opts = {}) {
		const newOpts: Opts = {
			...{
				color: this._color,
				bold: this._bold,
				underline: this._underline,
				verbose: this._verbose,
			},
			...opts,
		};

		return new Logger(
			this.testMode,
			this.apiMode,
			this.verboseMode,
			newOpts
		);
	}

	citrus(input?: string | object) {
		const newAttr = { color: "F7FF00" };
		if (!input) return this._self(newAttr);
		else {
			this._self(newAttr)._log(input);
		}
	}

	grey(input?: string | object) {
		const newAttr = { color: "aaaaaa" };
		if (!input) return this._self(newAttr);
		else {
			this._self(newAttr)._log(input);
		}
	}

	bold(input?: string | object) {
		const newAttr = { bold: true };
		if (!input) return this._self(newAttr);
		else {
			this._self(newAttr)._log(input);
		}
	}

	underline(input?: string | object) {
		const newAttr = { underline: true };
		if (!input) return this._self(newAttr);
		else {
			this._self(newAttr)._log(input);
		}
	}

	danger(input?: string | object) {
		const newAttr = { bold: true, color: "#eb445a" };
		if (!input) return this._self(newAttr);
		else {
			this._self(newAttr)._log(input);
		}
	}

	warn(input?: string | object) {
		const newAttr = { color: "#ff8709" };
		if (!input) return this._self(newAttr);
		else {
			this._self(newAttr)._log(input);
		}
	}

	info(input?: string | object) {
		const newAttr = { color: "#23a8f2" };
		if (!input) return this._self(newAttr);
		else {
			this._self(newAttr)._log(input);
		}
	}

	success(input?: string | object) {
		const newAttr = { color: "#2dd36f" };
		if (!input) return this._self(newAttr);
		else {
			this._self(newAttr)._log(input);
		}
	}

	verbose(input?: string | object) {
		const newAttr = { verbose: true };
		if (!input) return this._self(newAttr);
		else {
			this._self(newAttr)._log(input);
		}
	}

	get context() {
		return this;
	}

	private _logTree(str: string): string {
		let chalkObj = chalk.hex(this._color);

		if (this._bold) chalkObj = chalkObj.bold;
		if (this._underline) chalkObj = chalkObj.underline;

		return chalkObj(str);
	}

	private _log(input: string | object) {
		if (typeof input == "string") {
			const logOutput = this._logTree(this.sanitiseString(input) + "\n");
			this.StdoutWrite(logOutput);
		} else if (typeof input == "object") {
			const logOutput = util.inspect(input, false, null, true);
			this.StdoutWrite(logOutput);
		}

		return this._self({});
	}

	private sanitiseString(str: string): string {
		const maxW = 100;
		const newString: string[] = [];

		let newStr = "";
		if (str) newStr = str.toString();

		const splitStr = newStr.split("\n");

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
				);
			} else {
				newString.push(el);
			}
		});

		let outstr = newString.join("\n");

		return outstr;
	}

	multi(parts: uncalledFn[]) {
		let outstr = "";
		parts.forEach(el => {
			const fn = el[0];
			const str = el[1];
			outstr += fn._logTree(this.sanitiseString(str));
		});

		outstr += "\n";

		return this.StdoutWrite(outstr);
	}

	get dumpBuffer() {
		if (this.testMode) return devBuffer;
		else return null;
	}

	private StdoutWrite(data: string) {
		if ((!this.testMode && !this.apiMode) || this.verboseMode) {
			if (!this._verbose || this.verboseMode) {
				process.stdout.write(data);
			}
		} else {
			devBuffer += data;
			return data;
		}
	}

	get apiStatus() {
		return this.apiMode;
	}
}
