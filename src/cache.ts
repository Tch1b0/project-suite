import * as vscode from "vscode";
import * as fs from "fs";
import { Project } from "./projects";
import { Nullable } from "./types";

export class Cache {
    private static _instance: Nullable<Cache> = null;
    private filepath: string;
    private cache: Nullable<Project[]> = null;

    constructor(context: vscode.ExtensionContext) {
        Cache._instance = this;
        this.filepath = vscode.Uri.joinPath(
            context.extensionUri,
            "project-cache"
        ).fsPath;
    }

    static get(context: vscode.ExtensionContext): Cache {
        return Cache._instance !== null ? Cache._instance : new Cache(context);
    }

    getNullable(): Nullable<Cache> {
        return Cache._instance;
    }

    read(): Nullable<Project[]> {
        if (!fs.existsSync(this.filepath)) {
            return null;
        }

        const content = fs.readFileSync(this.filepath);
        const json = JSON.parse(content.toString());
        const data: Project[] = [];

        for (const entry of json) {
            data.push({
                name: entry["name"],
                language: entry["language"],
                path: entry["path"],
            });
        }

        if (this.cache === null) {
            this.cache = data;
        }

        return data;
    }

    write(data: Project[]) {
        this.cache = data;
        fs.writeFileSync(this.filepath, JSON.stringify(data));
    }

    getProjects(): Nullable<Project[]> {
        return this.cache !== null ? this.cache : this.read();
    }
}
