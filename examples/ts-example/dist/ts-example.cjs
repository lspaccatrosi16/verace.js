#!/usr/bin/env node
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// build/veraceTemp.cjs
var require_veraceTemp = __commonJS({
  "build/veraceTemp.cjs"(exports2) {
    "use strict";
    exports2.__esModule = true;
    function default_1(env) {
      console.log("Hello world from ".concat(env.name, " v").concat(env.version));
      console.log("Data:", env.data);
    }
    exports2["default"] = default_1;
  }
});

// verace.json
var require_verace = __commonJS({
  "verace.json"(exports2, module2) {
    module2.exports = {
      lang: "ts",
      name: "ts-example",
      version: "0.0.1",
      targets: [
        "win64",
        "linux64"
      ],
      data: {
        foo: "bar"
      },
      ts: {},
      go: {}
    };
  }
});

// build/index.cjs
var exec = require_veraceTemp();
var config = require_verace();
exec.default(config);
