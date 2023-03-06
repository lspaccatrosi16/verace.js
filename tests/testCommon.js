import test from "ava";

import { testLog } from "./helper/testLogOutput.js";

import { convToWin, handleExecError } from "../tsc-build/lib/common.js";

import make_logger from "../tsc-build/lib/log.js";

test("Should convert a general path to windows", (t) => {
  const input = "/path/to/some/thing";

  const output = convToWin(input, true);

  t.deepEqual(output, "\\path\\to\\some\\thing");
});

test("Should properly handle an exec error", (t) => {
  const log = make_logger(true);

  const execError = {
    stdout: new Buffer.from("This message should be printed as so"),
  };

  handleExecError(execError, log);

  t.true(testLog("This message should be printed as so", log));

  t.false(testLog("This shouldn't be printed", log));
});
