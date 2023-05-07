import * as vscode from "vscode";

export async function promptOrDefault<T>(
    question: string,
    def: T
): Promise<string | T> {
    return (
        (await vscode.window.showInputBox({
            prompt: question,
        })) ?? def
    );
}
