import bt from "../bt/tsc-build/api.js";

const tool = new bt({ path: "verace.config.mjs", verbose: false });

tool.setupEnvironment().unwrap();
tool.createExe();
