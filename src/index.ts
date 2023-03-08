import verace from "verace";

export interface VeraceEnv {
	name: string;
	version: string;
}

export default function (env: VeraceEnv) {
	verace(env);
}
