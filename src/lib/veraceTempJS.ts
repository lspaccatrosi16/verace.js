export default `
const exec = require("./veraceTemp.cjs");
const config = require("../verace.json");

exec.default(config);
`
