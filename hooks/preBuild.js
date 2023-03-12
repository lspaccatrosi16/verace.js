import fs from "fs";

fs.rmSync("assets", { force: true, recursive: true });
fs.cpSync("tools/", "assets/", { recursive: true });
