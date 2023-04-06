import test from "ava";
import { tmpdir } from "os";
import { join } from "path";

import fs from "fs";

import api from "../tsc-build/api.js";

test.serial("Should set up an instance correctly", t => {
	const tool = new api({
		path: "./examples/ts-example/verace.json",
		verbose: false,
	});

	const cfgResult = tool.setupEnvironment();

	if (cfgResult.isErr()) {
		throw cfgResult.unwrapErr();
	}

	const config = cfgResult.unwrap()._envConfig;

	t.assert(typeof config == "object" && "api" in config && config.api);

	tool.purgeEnvironment();
});

test.serial("Should apply overrideconfig", t => {
	const tool = new api({
		path: "./examples/ts-example/verace.json",
		verbose: false,
	});

	const cfgResult = tool.setupEnvironment();

	if (cfgResult.isErr()) {
		throw cfgResult.unwrapErr();
	}

	tool.setConfigOverrides({ entrypoint: "foo" })
		.setTsConfigOverride({
			test: "bar",
		})
		.setGoConfigOverride({ gomod: "baz" });

	const config = cfgResult.unwrap()._envConfig;

	t.deepEqual(config.configOverrides, {
		entrypoint: "foo",
		ts: { test: "bar" },
		go: { gomod: "baz" },
	});
	tool.purgeEnvironment();
});

test.serial("The path should be respected", t => {
	const path = "./examples/ts-example/verace.json";
	const tool = new api({
		path,
		verbose: false,
	});

	const cfgResult = tool.setupEnvironment();

	if (cfgResult.isErr()) {
		throw cfgResult.unwrapErr();
	}
	const config = cfgResult.unwrap()._envConfig;

	t.deepEqual(config.configLocation, path);

	tool.purgeEnvironment();
});

test.serial("Should recieve an error for improper config", t => {
	try {
		const tool = new api({
			a: "./examples/ts-example/verace.json",
			verbose: false,
		});
		tool.purgeEnvironment();
		t.fail();
	} catch (e) {
		t.pass();
	}
});

test.serial("Should only allow one execution at a time", t => {
	const tool = new api({
		path: "./examples/ts-example/verace.json",
		verbose: false,
	});

	const cfgResult = tool.setupEnvironment();

	if (cfgResult.isErr()) {
		throw cfgResult.unwrapErr();
	}

	const tool2 = new api({
		path: "./examples/ts-example/verace.json",
		verbose: false,
	});

	const cfgResult2 = tool2.setupEnvironment();

	if (cfgResult2.isErr()) {
		t.pass();
	} else t.fail();

	tool.purgeEnvironment();
});

test.serial("Should create a verace typescript project successfuly", t => {
	const createPath = join(tmpdir(), `verace-create`);

	fs.rmSync(createPath, {
		force: true,
		recursive: true,
	});

	fs.mkdirSync(createPath);

	const tool = new api({
		path: createPath,
		verbose: false,
	});

	const cfgResult = tool.setupEnvironment();

	if (cfgResult.isErr()) {
		throw cfgResult.unwrapErr();
	}

	cfgResult
		.unwrap()
		.createExe({
			lang: "ts",
			name: "my-project",
		})
		.then(res => {
			if (res.isErr()) {
				console.log(res.unwrapErr());
				t.fail();
			}

			if (fs.existsSync(join(createPath, "verace.config.mjs"))) {
				t.pass();
			}
		});
});
