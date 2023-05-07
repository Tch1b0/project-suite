import * as vscode from "vscode";
import { getProjects } from "./projects";
import { promptOrDefault } from "./utility";
import * as fs from "node:fs/promises";

export function activate(context: vscode.ExtensionContext) {
    let path: string | null =
        context.globalState.get<string>("projects-path") ?? null;

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "project-suite.setProjectDir",
            async () => {
                path = await promptOrDefault(
                    "Enter the full path of the parent directory of your projects",
                    null
                );
                if (path === null) {
                    return;
                }
                context.globalState.update("projects-path", path);

                try {
                    console.log(getProjects(path));
                } catch (e) {
                    console.error(e);
                }
            }
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "project-suite.projectSuite",
            async () => {
                const panel = vscode.window.createWebviewPanel(
                    "projectSuite",
                    "Project Suite",
                    vscode.ViewColumn.One,
                    { enableScripts: true }
                );

                const scriptOnDiskPath = vscode.Uri.joinPath(
                    context.extensionUri,
                    "src",
                    "suiteview.js"
                );
                const suiteViewSrc =
                    panel.webview.asWebviewUri(scriptOnDiskPath);

                const styleOnDiskPath = vscode.Uri.joinPath(
                    context.extensionUri,
                    "src",
                    "style.css"
                );
                const styleUri = panel.webview.asWebviewUri(styleOnDiskPath);

                panel.webview.html = getSuite(
                    (await fs.readFile(suiteViewSrc.fsPath)).toString(),
                    (await fs.readFile(styleUri.fsPath)).toString()
                );

                console.log(panel.webview.html);

                const path = context.globalState.get<string>("projects-path");
                if (path) {
                    const projects = getProjects(path);
                    await panel.webview.postMessage(projects);
                }

                panel.webview.onDidReceiveMessage(async (message) => {
                    console.log(vscode.Uri.from(message.path));
                    await vscode.commands.executeCommand(
                        "vscode.openFolder",
                        vscode.Uri.file(message.path)
                    );
                });
            }
        )
    );
}

export function deactivate() {}

function getSuite(script: string, style: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" contente="width=device-width, initial-scale=1.0">
	<title>Project Suite</title>
	<style>${style}</style>
</head>
<body>
	<p id="statusMessage"></p>
	<div id="projectContainer" ></div>
	<script>${script}</script>
</body>
</html>`;
}
