import { api } from "verace"
import type { APICONFIG } from "verace"
import type { APIResult } from "lib/executionEnvironment"

export default function (config: APICONFIG, test: boolean): Promise<APIResult> {
	return new Promise((resolve, reject) => {
		api(config, test).then(resolve).catch(reject)
	})
}
