import test from "ava"

import tp from "../tsc-build/api.js"

test("Should create the requested number of threads", (t) => {
    const threadNum = 4;
    const forks = new Array(20)
    forks.fill({file: "dummy", args: []})
    const pool = new tp(threadNum, forks, {debug: true});

    const {threads} = pool._internalConfig;

    t.deepEqual(threads, threadNum) 
})

test("Should reduce the number of threads to provided forks", t => {
    const threadNum = 4;
    const forks = new Array(1)
    forks.fill({file: "dummy", args: []})
    const pool = new tp(threadNum, forks, {debug: true});

    const {threads} = pool._internalConfig;

    t.deepEqual(threads, 1)
})