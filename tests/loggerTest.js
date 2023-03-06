import test from "ava";
import { make_logger } from "../tsc-build/lib/log.js";

import { testLog } from "./helper/testLogOutput.js";

test("Should output the exact input", (t) => {
	const log = make_logger(true);

	const baseStr = "Base normla";
	log(baseStr);

	const successStr = "Success aaaa";
	log(successStr);

	const multi = "Multi log";
	log().multi([[log().citrus().underline().bold().context, multi]]);

	t.true(testLog(baseStr, log));
	t.true(testLog(successStr, log));
	t.true(testLog(multi, log));
});
