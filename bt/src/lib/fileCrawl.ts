import fs from "fs-extra";
import path from "path";

const crawlFiles = (startdir: string) => {
	const list: string[] = [];
	if (fs.existsSync(startdir)) {
		fs.readdirSync(startdir).forEach(entry => {
			const name = path.join(startdir, entry);

			if (fs.statSync(name).isDirectory()) {
				list.push(...crawlFiles(name));
			} else {
				list.push(name);
			}
		});
	}

	return list;
};
export default crawlFiles;
