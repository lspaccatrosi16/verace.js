import fs from "fs-extra";
import path from "path";
import rustic from "rustic";

export function input(fileName: string): rustic.ResultEquipped<string, string> {
	let fp = path.join(process.cwd(), fileName);

	if (path.isAbsolute(fileName)) fp = fileName;

	if (!fs.existsSync(fp)) {
		return rustic.equip(rustic.Err(`FILE NOT FOUND: ${fp}`));
	}

	const file = fs.readFileSync(fp);
	return rustic.equip(rustic.Ok(file.toString()));
}

export function output(
	fileName: string,
	file: string
): rustic.ResultEquipped<null, string> {
	try {
		const fp = path.join(process.cwd(), fileName);
		if (!fs.existsSync(path.dirname(fp))) {
			console.log("INFO: Creating:", fp);
			fs.mkdirSync(path.dirname(fp), { recursive: true });
		}
		fs.writeFileSync(fp, file);

		return rustic.equip(rustic.Ok(null));
	} catch (e) {
		return rustic.equip(rustic.Err(e));
	}
}

export function rmD(dir: string): void {
	const fp = path.join(process.cwd(), dir);
	if (fs.existsSync(fp)) fs.rmSync(fp, { recursive: true });
}
