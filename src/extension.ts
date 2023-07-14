import * as vscode from "vscode";
import { getProjects } from "./projects";
import { promptOrDefault } from "./utility";
import * as fs from "fs";
import { Cache } from "./cache";

export function activate(context: vscode.ExtensionContext) {
    const cache = Cache.get(context);

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

                panel.webview.html = getSuite((name: string) => {
                    return panel.webview.asWebviewUri(
                        vscode.Uri.joinPath(context.extensionUri, "src", name)
                    );
                });

                const path = context.globalState.get<string>("projects-path");
                panel.webview.onDidReceiveMessage(async (message) => {
                    switch (message.action) {
                        case "open-project": {
                            await vscode.commands.executeCommand(
                                "vscode.openFolder",
                                vscode.Uri.file(message.path)
                            );
                            break;
                        }
                        case "refresh": {
                            // path HAS to exist here, because the "refresh" button,
                            // which calls this action, is only loaded when path is set
                            cache.write(getProjects(path!));
                            // cached value HAS to exist, because it was set only a line previous
                            await panel.webview.postMessage(cache.read()!);
                            await vscode.window.showInformationMessage(
                                "✔ Project Suite refreshed projects"
                            );
                        }
                    }
                });

                if (path) {
                    let projects = cache.getProjects();
                    if (projects === null) {
                        projects = getProjects(path);
                        cache.write(projects);
                    }
                    await panel.webview.postMessage(projects);
                }
            }
        )
    );
}

export function deactivate() {}

function getSuite(getWebURI: (name: string) => vscode.Uri): string {
    let style = `{{STYLE}}`;
    let script = `{{SCRIPT}}`;

    // on the release build, the style.css file is inserted into the braced style below,
    // so the length of the string won't equal 9
    const isDebug = `{{STYLE}}`.length === 9;
    if (isDebug) {
        const suiteViewSrc = getWebURI("suiteview.js");
        const styleSrc = getWebURI("style.css");

        script = fs.readFileSync(suiteViewSrc.fsPath).toString();
        style = fs.readFileSync(styleSrc.fsPath).toString();
    }

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
	<div class="searchBarBox">
        <input type="text" id="searchBar" placeholder="🔎Search Project" />
        <button id="refreshButton">&#128260; Refresh</button>
    </div>
	<div id="projectContainer" ></div>
	<script>${script}</script>
</body>
</html>`;
}
