import fs from "fs-extra";
import path from "path";

export default function scanDir(
  dir: string,
  endsWith = ".md",
  lookForDir = false
): Array<[string, string]> {
  const output: Array<[string, string]> = [];

  const searchDir = path.join(process.cwd(), dir);
  fs.readdirSync(searchDir).forEach((fp) => {
    const np = path.join(dir, fp);
    if (fs.statSync(np).isDirectory()) {
      if (lookForDir) {
        output.push([np, fp]);
      } else output.push(...scanDir(np, endsWith));
    } else {
      if (fp.endsWith(endsWith) && !lookForDir) {
        const joined = path.join(dir, fp);
        output.push([joined, fp]);
      }
    }
  });
  return output;
}
