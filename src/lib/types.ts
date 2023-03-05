export interface BaseConfig {
	lang: "go" | "ts";
	name: string;
	version: string;
	targets: Array<"win64" | "linux64">;
	gomod?: string;
	skipPkg?: boolean;
	hooks?: {
		postBuild: string;
		preBuild: string;
	};
	data: Record<string, unknown>;
}
