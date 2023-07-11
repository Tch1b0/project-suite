import * as vscode from "vscode";
import * as fs from "fs";
import { Project } from "./projects";

type Nullable<T> = T | null;

class Cache {
    private static _instance: Nullable<Cache> = null;
    private filepath: vscode.Uri;

    constructor(context: vscode.ExtensionContext) {
        Cache._instance = this;
        this.filepath = vscode.Uri.joinPath(
            context.extensionUri,
            "project-cache"
        );
    }

    get(context: vscode.ExtensionContext): Cache {
        return Cache._instance !== null ? Cache._instance : new Cache(context);
    }

    getNullable(): Nullable<Cache> {
        return Cache._instance;
    }

    read() {
        fs.readFileSync(this.filepath.toString());
    }

    getProjects(): Nullable<Project[]> {
        return null;
    }
}
