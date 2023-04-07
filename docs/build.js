import fs from "fs-extra";
import path from "path";

//convert the code below to sync version

fs.readdir("generated", (err, files) => {
	if (err) {
		console.log(err);
	} else {
		files.forEach(file => {
			if (file !== "README.md" && file !== ".nojekyll") {
				const newPath = `docgen/api/${file}`;
				const dn = path.dirname(newPath);

				if (!fs.existsSync(dn)) {
					fs.mkdirSync(dn, { recursive: true });
				}
				fs.copySync(`generated/${file}`, newPath, { recursive: true });
			}
		});
	}
});
