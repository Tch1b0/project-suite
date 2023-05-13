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

                const getWebURI = (name: string) => {
                    const onDisk = vscode.Uri.joinPath(
                        context.extensionUri,
                        "src",
                        name
                    );
                    return panel.webview.asWebviewUri(onDisk);
                };

                const suiteViewSrc = getWebURI("suiteview.js");
                const styleSrc = getWebURI("style.css");

                panel.webview.html = getSuite(
                    (await fs.readFile(suiteViewSrc.fsPath)).toString(),
                    (await fs.readFile(styleSrc.fsPath)).toString()
                );

                const path = context.globalState.get<string>("projects-path");
                if (path) {
                    const projects = getProjects(path);
                    await panel.webview.postMessage(projects);
                }

                panel.webview.onDidReceiveMessage(async (message) => {
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
	<div class="searchBarBox"><input type="text" id="searchBar" placeholder="🔎Search Project" /></div>
	<div id="projectContainer" ></div>
	<script>${script}</script>
</body>
</html>`;
}
