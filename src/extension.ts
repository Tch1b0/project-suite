import * as vscode from "vscode";
import { getProjects } from "./projects";
import { promptOrDefault } from "./utility";
import * as fs from "node:fs/promises";
import { js as suiteviewScript, css as suiteviewStyle } from "./suiteview";

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

                panel.webview.html = getSuite();

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

function getSuite(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" contente="width=device-width, initial-scale=1.0">
	<title>Project Suite</title>
	<style>${suiteviewStyle}</style>
</head>
<body>
	<p id="statusMessage"></p>
	<div class="searchBarBox"><input type="text" id="searchBar" placeholder="🔎Search Project" /></div>
	<div id="projectContainer" ></div>
	<script>${suiteviewScript}</script>
</body>
</html>`;
}
