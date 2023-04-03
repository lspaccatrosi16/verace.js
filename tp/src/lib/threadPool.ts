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

import child_process from "child_process";

export interface Fork {
	file: string;
	args: string[];
}

interface Worker {
	no: number;
	busy: boolean;
}

type PromiseResolver<T> = (value: T[] | PromiseLike<T[]>) => void;

type PromiseRejecter = (reason?: any) => void;

export interface OptionalConfig {
	debug: boolean;
}

export default class ThreadPool<T> {
	private workers: Worker[];
	private toRun: Fork[];
	private results: T[];
	private resolve: PromiseResolver<T>;
	private reject: PromiseRejecter;
	private tasksProvided: number;

	private completed = 0;

	private optionalConfig: OptionalConfig;
	constructor(MAX_THREADS: number, list: Fork[], config?: OptionalConfig) {
		const workers: Worker[] = (() => {
			const w = [];
			let max = MAX_THREADS;
			if (max > list.length) {
				max = list.length;
			}
			for (let i = 0; i < max; i++) {
				w.push({
					no: i,
					busy: false,
				});
			}
			return w;
		})();

		this.workers = workers;
		this.toRun = [...list];
		this.tasksProvided = list.length;
		this.optionalConfig = config;

		this.log(`Thread pool initialised with ${workers.length} threads`);
	}

	start(): Promise<T[]> {
		return new Promise((resolve, reject) => {
			this.results = [];
			this.resolve = resolve;
			this.reject = reject;
			this.alloc();
		});
	}

	private log(...args: unknown[]) {
		if (this.optionalConfig && this.optionalConfig.debug)
			console.log(...args);
	}

	private alloc() {
		const availWorkers = this.workers.filter(w => !w.busy);

		for (let i = 0, len = availWorkers.length; i < len; i++) {
			const w = availWorkers[i];
			this.workers[w.no].busy = true;
			const forkInstance = this.toRun.shift();

			if (forkInstance) {
				this.log(
					`THREAD ALLOC: #${w.no + 1} ${
						forkInstance.file
					} ${forkInstance.args.join(" ")}`
				);

				const cp = child_process.fork(
					forkInstance.file,
					forkInstance.args
				);

				cp.on("message", (item: T) => {
					this.log(`MESSAGE RECIEVED FORM WORKER ${w.no + 1}`);
					this.results.push(item);
				});

				cp.on("error", e => {
					this.reject(e);
				});

				cp.on("exit", () => this.recycleWorker(w));
			} else {
				break;
			}
		}
	}

	private recycleWorker(w: Worker) {
		this.log(`THREAD FREED #${w.no + 1}`);
		this.completed++;
		this.log(`DONE: ${this.completed} / ${this.tasksProvided}`);

		this.workers[w.no].busy = false;

		if (this.toRun.length > 0) this.alloc();
		else this.tasksCompleted();
	}

	private get busyWorkers() {
		return this.workers.filter(w => w.busy).length;
	}

	private tasksCompleted() {
		if (this.busyWorkers == 0 && this.tasksProvided == this.completed) {
			this.log("All workers settled. Resolving promise");
			this.resolve(this.results);
		}
	}
}
