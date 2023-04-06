import rustic from "rustic";
import type { Result } from "rustic";
const { Ok } = rustic;
export function infallable<T>(val: T): Result<T, string> {
	return Ok(val);
}

export function infallablePromise<T>(val: T): Promise<Result<T, string>> {
	return new Promise(resolve => {
		resolve(Ok(val));
	});
}
