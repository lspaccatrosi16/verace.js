import { input, output, rmD } from "./io";

import directory from "./directory";

import ThreadPool, { Fork } from "../../../tp/tsc-build/api";

import path from "path";
import type { OutputBackend, WorkerReturn } from "./types";

export default async function (backend: OutputBackend, fileName?: string) {
	if (fileName) {
		const splitted = fileName.split("/");
		const baseFileName = splitted[splitted.length - 1].slice(0, -3);

		const fork: Fork = {
			file: "worker.cjs",
			args: [fileName, baseFileName],
		};
		await runFile(1, [fork]);
	} else {
		console.log("No filepath provided. Running in directory compile mode.");
		//Directory compile mode:

		const workerFilePath = path.join(
			__dirname,
			"assets/blog-build-worker.cjs"
		);
		// const worker = fs.readFileSync(workerFilePath);
		const worker = input(workerFilePath);
		output("worker.cjs", worker);

		rmD("pages/blog");

		// const rr = runMultiFile(path, name);

		const runList = directory("blog");

		const forks: Fork[] = runList.map(l => {
			return { file: `worker.cjs`, args: l };
		});

		const manifest = await runFile(6, forks);
		rmD("worker.cjs");

		await backend(manifest);

		console.log("Directory build completed");
	}
}

async function runFile(
	threads: number,
	forks: Fork[]
): Promise<WorkerReturn[]> {
	const pool = new ThreadPool<WorkerReturn>(threads, forks, { debug: false });
	return await pool.start();
}
