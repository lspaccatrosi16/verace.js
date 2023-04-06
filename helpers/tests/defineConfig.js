import test from "ava"
import {defineConfig } from "../tsc-build/api.js"

test("Should return what is provided", (t) => {

    const input = {
        foo: "bar",
        a: {
            deeply: {
                nested: {
                    property: {
                        foo: "bar"
                    }
                }
            }
        }        
    }

    const output = defineConfig(input)

    t.deepEqual(output, input)


} )
