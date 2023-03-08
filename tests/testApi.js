import test from "ava";

import api from "../tsc-build/api.js";

test.serial(
  "Should properly build the example typescript project",
  async (t) => {
    const res = await api(
      { command: "build-exe", path: "./examples/ts-example/verace.json" },
      false
    );

    console.log("testres", res);

    t.true(res.success)
  }
);

test.serial("Should properly build the example go project", async (t) => {
  const res = await api(
    { command: "build-exe", path: "./examples/go-example/verace.json" },
    false
  );
  console.log("testres", res);

  t.true(res.success)
});
