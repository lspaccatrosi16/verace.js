import test from "ava";

import { validate } from "../tsc-build/lib/veraceConfig.js";

test("Check basic config generation", async (t) => {
	const result = await validate({
		name: "test",
		lang: "ts",
		version: "1.0.0",
		targets: ["win64"],
	});

	t.deepEqual(result, {
		lang: "ts",
		name: "test",
		version: "1.0.0",
		targets: ["win64"],
		hooks: { preBuild: "", postBuild: "", prePkg: "" },
		entrypoint: "",
		outDir: "bin",
		ts: {
			buildDir: "tsc-build",
			skipPkg: false,
			test: "",
			produceTypes: false,
			cleanAfterBuild: false,
			assets: "assets",
			noBytecode: false
		},
		version: "1.0.0",
		go: {
			gomod: "",

		}
	});
});

test("Check incorrect values", async (t) => {
	try {
		await validate({
			name: "test",
			lang: "ts",
			version: "1.0.0",
			targets: ["win6"],
		});

		t.fail();
	} catch (e) {
		t.pass();
	}
});

test("Disallow unknown values", async (t) => {
	try {
		await validate({
			name: "test",
			lang: "ts",
			version: "1.0.0",
			targets: ["win64"],
			cat: "dog",
		});

		t.fail();
	} catch (e) {
		t.pass();
	}
});

test("Allow data values", async (t) => {
	const result = await validate({
		name: "test",
		lang: "ts",
		version: "1.0.0",
		targets: ["win64"],
		data: {
			cat: "dog",
			foo: {
				bar: "baz",
			},
		},
	});
	t.deepEqual(result, {
		lang: "ts",
		name: "test",
		version: "1.0.0",
		targets: ["win64"],
		hooks: { preBuild: "", postBuild: "", prePkg: "" },
		entrypoint: "",
		outDir: "bin",
		ts: {
			buildDir: "tsc-build",
			skipPkg: false,
			test: "",
			produceTypes: false,
			cleanAfterBuild: false,
			assets: "assets",
			noBytecode: false
		},
		version: "1.0.0",
		go: {
			gomod: "",

		},
		data: {
			cat: "dog",
			foo: {
				bar: "baz",
			},
		}
	});
});
