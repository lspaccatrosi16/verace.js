import test from "ava"
import tp from "../tsc-build/api.js"
import fs from "fs"



const worker = `
process.send("Hey there");
`
const workerName = "test-temp-worker.js"

test.before(() => {
    fs.writeFileSync(workerName, worker)
})

test.after(() => {
    fs.rmSync(workerName)
})




test("Should be able to run a large queue of files", async t => {
    const threadNum = 4;
    const forks = new Array(200)
    forks.fill({ file: workerName, args: [] })
    const pool = new tp(threadNum, forks);

    const results = await pool.start()
    t.deepEqual(results.length, forks.length)

})

test("Should not break with a large amount of threads", async t => {
    const threadNum = 50;
    const forks = new Array(200)
    forks.fill({ file: workerName, args: [] })
    const pool = new tp(threadNum, forks);

    const results = await pool.start()
    t.deepEqual(results.length, forks.length)

})
