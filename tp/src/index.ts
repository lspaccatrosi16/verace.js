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

import ThreadPool, { Fork } from "./lib/threadPool";

export interface VeraceEnv {
	name: string;
	version: string;
	data: Record<string, unknown>;
}

export default function (env: VeraceEnv) {
	run(env).then(() => {});
}

async function run(env: VeraceEnv) {
	if (process.argv.length < 3) {
		version(env);
		process.exit(0);
	}

	const cmd = process.argv[2];

	switch (cmd) {
		case "version":
			version(env);
			process.exit(0);
		default: {
			if (process.argv.length < 5) {
				console.log(
					"Must provide a number of threads, a number of times to execute, and a worker!"
				);
				process.exit(1);
			}

			const threads = parseInt(process.argv[2]);
			const times = parseInt(process.argv[3]);
			const worker = process.argv[4];
			const args = process.argv.slice(5);

			const forkArr: Fork[] = [];

			for (let i = 0; i < times; i++) {
				forkArr.push({ file: worker, args });
			}

			const pool = new ThreadPool(threads, forkArr);
			const res = await pool.start();
			console.log(res);
		}
	}
}

function version(env: VeraceEnv) {
	console.log(env.version);
}
