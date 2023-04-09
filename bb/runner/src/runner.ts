import { output, rmD } from "./io";

import directory from "./directory";

import worker from "worker";

import ThreadPool, { Fork } from "../../../tp/tsc-build/api";

import type { OutputBackend, WorkerReturn } from "./types";
import rustic from "rustic";

export default async function <T>(
	backend: OutputBackend<T>,
	fileName?: string
): Promise<rustic.ResultEquipped<T, string>> {
	if (fileName) {
		try {
			output(
				"worker.cjs",
				Buffer.from(worker, "base64").toString("ascii")
			).unwrap();
			const splitted = fileName.split("/");
			const baseFileName = splitted[splitted.length - 1].slice(0, -3);

			const fork: Fork = {
				file: "worker.cjs",
				args: [fileName, baseFileName],
			};
			const manifest = await runFile(1, [fork]);

			rmD("worker.cjs");
			const result: T = await backend(manifest);
			return rustic.equip(rustic.Ok(result));
		} catch (e) {
			console.error(e);
			return rustic.equip(rustic.Err(e));
		}
	} else {
		try {
			console.log(
				"No filepath provided. Running in directory compile mode."
			);

			output(
				"worker.cjs",
				Buffer.from(worker, "base64").toString("ascii")
			).unwrap();
			rmD("pages/blog");

			const runList = directory("blog");

			const forks: Fork[] = runList
				.unwrap()
				.map(l => ({ file: `worker.cjs`, args: l }));

			const manifest = await runFile(6, forks);
			rmD("worker.cjs");

			const result: T = await backend(manifest);

			console.log("Directory build completed");
			return rustic.equip(rustic.Ok(result));
		} catch (e) {
			console.error(e);
			return rustic.equip(rustic.Err(e));
		}
	}
}

async function runFile(
	threads: number,
	forks: Fork[]
): Promise<WorkerReturn[]> {
	const pool = new ThreadPool<WorkerReturn>(threads, forks, { debug: false });
	return await pool.start();
}
