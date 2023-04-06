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

import path from "path";
import fs from "fs-extra";
import GetExecutionEnv from "./executionEnvironment";
import os from "os";
import child_process from "child_process";
import * as url from "url";
import rustic from "rustic";
import type { Result } from "rustic";
const { Err, Ok } = rustic;
export default function (infile: string, outfile: string) {
	switch (process.platform) {
		case "win32":
			runTranslate("cjs-transpile.exe", infile, outfile);
			break;

		case "linux":
			runTranslate("cjs-transpile", infile, outfile);
			break;
	}
}

const runTranslate = (
	fn: string,
	infile: string,
	outfile: string
): Result<null, string> => {
	const env = GetExecutionEnv.getInstance();
	const { log } = env;
	let dn = "";

	if (typeof __dirname == "string" && __dirname != "") {
		log().verbose("Resolution strat: __dirname");
		dn = __dirname;
	} else if (typeof import.meta.url == "string" && import.meta.url != "") {
		log().verbose("Resolution strat: import.meta.url");
		dn = path.dirname(url.fileURLToPath(new URL(".", import.meta.url)));
	} else {
		log().warn(
			"No suitable resolution strat found. Trying hardcoded value"
		);
		dn = "/snapshot/dist";
	}

	log().verbose(`Int dirname: "${dn}"`);

	const dir = path.join(dn, "assets", fn);

	log().verbose(`Looking for helper at: ${dir}`);

	if (fs.existsSync(dir)) {
		const data = fs.readFileSync(dir);
		const tempPath = path.join(os.tmpdir(), fn);

		fs.writeFileSync(tempPath, data, {
			mode: 0o777,
		});
		child_process.execSync(
			`${tempPath} --mode recursive --path ${infile} --output ${outfile}`,
			{ stdio: "inherit" }
		);
		fs.rmSync(tempPath, { force: true });
		return Ok(null);
	} else {
		return Err("Could not resolve go helper bin");
	}
};
