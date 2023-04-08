import fs from "fs-extra";
import path from "path";
import rustic from "rustic";

export default function scanDir(
	dir: string,
	endsWith = ".md",
	lookForDir = false
): rustic.ResultEquipped<Array<[string, string]>, string> {
	const output: Array<[string, string]> = [];

	const searchDir = path.join(process.cwd(), dir);
	fs.readdirSync(searchDir).forEach(fp => {
		const np = path.join(dir, fp);
		if (fs.statSync(np).isDirectory()) {
			if (lookForDir) {
				output.push([np, fp]);
			} else {
				const result = scanDir(np, endsWith);
				if (result.isErr()) return result;
				else output.push(...result.unwrap());
			}
		} else {
			if (fp.endsWith(endsWith) && !lookForDir) {
				const joined = path.join(dir, fp);
				output.push([joined, fp]);
			}
		}
	});
	return rustic.equip(rustic.Ok(output));
}
