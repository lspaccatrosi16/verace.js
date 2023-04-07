//See https://github.com/lspaccatrosi16/verace.js/#readme for detailed documentation

export interface VeraceEnv {
	name: string;
	version: string;
	data: Record<string, unknown>;
}

export default function (env: VeraceEnv) {
	run(env).then(() => {});
}

async function run(env: VeraceEnv) {
	throw new Error("Should not ever run this from the command line");
}
