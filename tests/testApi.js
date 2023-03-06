import test from "ava";

import api from "../tsc-build/api.js";

test("Should properly build the example typescript project", async (t) => {
	const res = await api(
		{ command: "build-exe", path: "./examples/ts-example/verace.json" },
		true
	);

	console.log("testres", res);

	t.deepEqual(
		{
			command: "build-exe",
			success: true,
			config: {
				lang: "ts",
				name: "ts-example",
				version: "0.0.1",
				targets: ["win64", "linux64"],
				gomod: "",
				skipPkg: false,
				hooks: { preBuild: "", postBuild: "" },
				produceTypes: false,
				data: { foo: "bar" },
				test: "",
				cleanAfterBuild: false,
			},
		},
		res
	);
});

test("Should properly build the example go project", async (t) => {
	const res = await api(
		{ command: "build-exe", path: "./examples/go-example/verace.json" },
		true
	);
	console.log("testres", res);

	t.deepEqual(
		{
			command: "build-exe",
			success: true,
			config: {
				lang: "go",
				name: "go-example",
				version: "0.0.1",
				targets: ["win64", "linux64"],
				gomod: "lspaccatrosi16/verace.js/examples/go-example",
				skipPkg: false,
				hooks: { preBuild: "", postBuild: "" },
				produceTypes: false,
				data: { foo: "bar" },
				test: "",
				cleanAfterBuild: false,
			},
		},
		res
	);
});
