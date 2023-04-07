import runner from "./runner";
import type {
	OutputBackend,
	WorkerReturn,
	ManifestItem,
	Metadata,
} from "./types";

export default class {
	private filename?: string;
	private backend?: OutputBackend;
	constructor(filename?: string) {
		this.filename = filename;
	}

	useBackend(backend: OutputBackend) {
		this.backend = backend;
	}

	run(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.backend) {
				runner(this.backend, this.filename).then(resolve).catch(reject);
			} else {
				reject("Must provide a backend");
			}
		});
	}
}

export type { OutputBackend, WorkerReturn, ManifestItem, Metadata };
