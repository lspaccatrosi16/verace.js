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
		gomod: "",
		skipPkg: false,
		hooks: { preBuild: "", postBuild: "" },
		produceTypes: false,
		test: "",
		cleanAfterBuild: false,
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
		gomod: "",
		skipPkg: false,
		hooks: { preBuild: "", postBuild: "" },
		produceTypes: false,
		test: "",
		cleanAfterBuild: false,
		data: {
			cat: "dog",
			foo: {
				bar: "baz",
			},
		},
	});
});
