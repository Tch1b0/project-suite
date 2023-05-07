import { readdirSync, statSync } from "fs";
import * as pathutil from "node:path";

export interface Project {
    name: string;
    language: string | null;
    path: string;
}

export function getProjects(path: string): Project[] {
    const content = readdirSync(path);

    let projects: Project[] = [];

    if (content.includes(".git")) {
        projects.push({
            name: pathutil.basename(path),
            language: getProjectLanguage(path),
            path: path,
        });
    } else if (content.length !== 0) {
        for (const item of content) {
            const dir = pathutil.join(path, item);
            if (isDir(dir) && !item.startsWith(".")) {
                projects = projects.concat(getProjects(dir));
            }
        }
    }

    return projects;
}

function getProjectLanguage(path: string): string | null {
    const extensionOccurences: Map<string, number> = new Map();

    const MAX_FILE_DEPTH = 20;
    let fileDepth = 0;

    const countOccurences = (subPath: string) => {
        for (const item of readdirSync(subPath)) {
            fileDepth++;

            if (fileDepth >= MAX_FILE_DEPTH) {
                return;
            }
            if (item.startsWith(".")) {
                continue;
            }

            const splitted = item.split(".");
            const dir = pathutil.join(subPath, item);
            if (splitted.length > 1) {
                const extension = splitted[splitted.length - 1];
                const count = extensionOccurences.has(extension)
                    ? extensionOccurences.get(extension)! + 1
                    : 0;
                extensionOccurences.set(extension, count);
            } else if (isDir(dir)) {
                countOccurences(dir);
            }
        }
    };

    countOccurences(path);
    const occurenceArray = Array.from(extensionOccurences.entries()).sort(
        (a, b) => b[1] - a[1]
    );

    return occurenceArray.length > 0 ? occurenceArray[0][0] : null;
}

function isDir(path: string): boolean {
    return statSync(path).isDirectory();
}
