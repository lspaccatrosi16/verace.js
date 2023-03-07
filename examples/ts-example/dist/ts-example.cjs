#!/usr/bin/env node
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// build/veraceTemp.cjs
var require_veraceTemp = __commonJS({
  "build/veraceTemp.cjs"(exports2, module2) {
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var tsc_build_exports = {};
    __export(tsc_build_exports, {
      default: () => tsc_build_default
    });
    module2.exports = __toCommonJS(tsc_build_exports);
    function tsc_build_default(env) {
      console.log(`Hello world from ${env.name} v${env.version}`);
      console.log("Data:", env.data);
    }
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
      }
    };
  }
});

// build/index.cjs
var exec = require_veraceTemp();
var config = require_verace();
exec.default(config);
