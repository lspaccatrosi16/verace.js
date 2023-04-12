import runner from "./runner";
import type {
	OutputBackend,
	WorkerReturn,
	ManifestItem,
	Metadata,
} from "./types";

interface BBConfig {
	filename?: string;
	dirname?: string;
}

export default class<T> {
	private filename?: string;
	private dirname?: string;
	private backend?: OutputBackend<T>;
	constructor(cfg: BBConfig) {
		this.filename = cfg.filename;
		this.dirname = cfg.dirname;
	}

	useBackend(backend: OutputBackend<T>) {
		this.backend = backend;
	}

	run(): Promise<T> {
		return new Promise((resolve, reject) => {
			if (this.backend) {
				runner<T>(
					this.backend,
					this.filename ? this.filename : this.dirname
				).then(r => {
					if (r.isOk()) {
						resolve(r.unwrap());
					} else {
						reject(r.unwrapErr());
					}
				});
			} else {
				reject("Must provide a backend");
			}
		});
	}
}

export type { OutputBackend, WorkerReturn, ManifestItem, Metadata };
