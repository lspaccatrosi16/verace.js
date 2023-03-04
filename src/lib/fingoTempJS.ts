export default `
const exec = require("./fingoTemp.cjs");
const config = require("../fingo.json");

exec.default(config);
`;
