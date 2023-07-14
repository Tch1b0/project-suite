const { execSync } = require("child_process");
const { readFileSync, writeFileSync } = require("fs");

const extPath = "./src/extension.ts";

const oldContent = readFileSync(extPath).toString();
const script = readFileSync("./src/suiteview.js")
    .toString()
    .replaceAll("`", "\\`")
    .replaceAll("$", "\\$");
const style = readFileSync("./src/style.css").toString();

console.warn(`Do not edit ${extPath} while this is running`);

writeFileSync(
    extPath,
    oldContent.replaceAll("{{SCRIPT}}", script).replaceAll("{{STYLE}}", style)
);
try {
    execSync("vsce package");
} catch (e) {
    console.error(e.output.toString());
}
writeFileSync(extPath, oldContent);
