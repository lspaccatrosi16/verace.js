//See https://github.com/lspaccatrosi16/verace.js/#readme for detailed documentation

export interface VeraceEnv {
	name: string;
	version: string;
	data: Record<string, unknown>;
}

export default function (env: VeraceEnv) {
	throw new Error("Helpers should never be executed");
}
