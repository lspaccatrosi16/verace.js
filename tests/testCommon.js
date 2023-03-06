import test from "ava";

import { testLog } from "./helper/testLogOutput.js";

import { convToWin, handleExecError } from "../tsc-build/lib/common.js";

import { make_logger } from "../tsc-build/lib/log.js";

test("Should convert a general path to windows", (t) => {
	const input = "/path/to/some/thing";

	const output = convToWin(input, true);

	t.deepEqual(output, "\\path\\to\\some\\thing");
});
