import fs from "fs-extra";
import path from "path";

export function input(fileName: string): string {
  let fp = path.join(process.cwd(), fileName);

  if (path.isAbsolute(fileName)) fp = fileName;

  if (!fs.existsSync(fp)) {
    console.log(`FILE NOT FOUND: ${fp}`);
    process.exit(1);
  }

  const file = fs.readFileSync(fp);
  return file.toString();
}

export function output(fileName: string, file: string): void {
  const fp = path.join(process.cwd(), fileName);
  if (!fs.existsSync(path.dirname(fp))) {
    console.log("INFO: Creating:", fp);
    fs.mkdirSync(path.dirname(fp), { recursive: true });
  }
  fs.writeFileSync(fp, file);
}

export function rmD(dir: string): void {
  const fp = path.join(process.cwd(), dir);
  if (fs.existsSync(fp)) fs.rmSync(fp, { recursive: true });
}
