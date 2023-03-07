import api from "./tsc-build/api.js";

//

await api({
  path: "./examples/go-example/verace.json",
  command: "build-exe",
}).then((res) => {
  console.log("promise 2 resolved");
  console.log(res);
});
await api({
  path: "./examples/ts-example/verace.json",
  command: "build-exe",
}).then((res) => {
  console.log("promise 1 resolved");
  console.log(res);
});
