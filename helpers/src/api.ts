import type { BaseConfig } from "../../bt/tsc-build/api";

function _(c: BaseConfig): BaseConfig {
	return c;
}

const Config = _({});

export function defineConfig(config: typeof Config) {
	return config;
}
