import fs from "fs";
import path from "path";

const file = fs
	.readFileSync(
		path.join(process.cwd(), "../worker/dist/blog-build-worker.cjs")
	)
	.toString("base64");
// .replace(/`/g, "\\`")
// .replace(/\$/g, "\\$")
// .replace(/\//g, "\\/")
// .replace(/\%/g, "\\%")
// .replace(/\\n/g, "\\n");

const wrapped = `export default \`${file}\``;

fs.writeFileSync(path.join(process.cwd(), "src/worker.ts"), wrapped);
