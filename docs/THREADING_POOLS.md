# Threading Pools

### Basic Usage

Run with `npx`:

```bash
$ npx tp -p verace.js [worker.js] [no of times] [no of workers]
```

Running through the js/ts api

```js
import tp from "verace.js/tp";

// An array of objects which have a file and args fields
const myTasks = [
	{ file: "worker.js", args: [] },
	{ file: "worker2.js", args: [] },
];

// The maximum number of threads to use.
const threads = 4;

const pool = new tp(threads, myTasks);

pool.start().then(results => {
	console.log(results);
});
```

### A worker

```js
// worker.js

console.log("foo");

// Whatever is sent here is returned as a result in the parent process
process.send("I said foo");
```

### Typescript usage

```ts
// Setup tasks and threads the same as before

// The type passed is used as the return type from pool.start()
const pool = new tp<MyReturnType>(threads, myTasks);

pool.start().then((results: MyReturnType[]) => {
	console.log(results);
});
```
