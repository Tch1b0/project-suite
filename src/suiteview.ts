export const css = `
#projectContainer {
    display: grid;
    grid-template-columns: auto auto auto auto auto;
    grid-row-gap: 3em;
}

#searchBar {
    width: 250px;
    padding: 5px;
    background: transparent;
    color: white;
    margin: 50px;
    border-radius: 10px;
    border: 2px solid white;
    text-align: center;
}

.searchBarBox {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.project {
    margin: 5px;
    border: 3px solid white;
    border-radius: 10px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-content: center;
    align-items: center;
    text-align: center;
    transition: 0.25s;
}

.project:hover {
    background-color: rgba(34, 34, 34, 0.8);
    cursor: pointer;
}

img {
    width: 50px;
}
`;
export const js = `
// imports
const vscode = acquireVsCodeApi();

// elements
const statusMessage = document.getElementById("statusMessage");
const projectContainer = document.getElementById("projectContainer");
const searchBar = document.getElementById("searchBar");

// variables
let projects = [];

searchBar.addEventListener("input", (_) => {
    const substr = searchBar.value.toLowerCase();
    console.log(substr);
    if (substr.length === 0) {
        renderProjects(projects);
    } else {
        renderProjects(
            projects.filter((v) => v.name.toLowerCase().includes(substr))
        );
    }
});

updateStatusMessage();

window.addEventListener("message", (ev) => {
    projects = ev.data;
    state = "finished";
    renderProjects(projects);
});

function updateStatusMessage() {
    if (projects.length === 0) {
        statusMessage.textContent = "Loading...";
        searchBar.style = "display: none;";
    } else {
        statusMessage.textContent = "";
        searchBar.style = "display: block;";
    }
}

function renderProjects(projects) {
    while (projectContainer.firstChild) {
        projectContainer.removeChild(projectContainer.lastChild);
    }

    for (const proj of projects) {
        const el = createProjectEl(proj);
        projectContainer.appendChild(el);
    }

    updateStatusMessage();
}

function createProjectEl(project) {
    const div = document.createElement("div");
    div.classList.add("project");
    div.onclick = async () => {
        await vscode.postMessage({
            command: "open-project",
            path: project.path,
        });
    };

    const img = document.createElement("img");
    img.src = getLangImageURL(project.language);
    img.onerror = (e1) => {
        img.src = getDefaultImageURL();
        console.error(e1);
        img.onerror = (e2) => {
            console.error(e2);
        };
    };
    div.appendChild(img);

    const p = document.createElement("h2");
    p.textContent = project.name;
    div.appendChild(p);

    return div;
}

function getLangImageURL(langshort) {
    const name =
        {
            ts: "typescript",
            js: "javascript",
            py: "python",
            rb: "ruby",
            rs: "rust",
            "c++": "cplusplus",
            cpp: "cplusplus",
            "c#": "csharp",
            cs: "csharp",
            "f#": "fsharp",
            fs: "fsharp",
            ps: "windows8",
            ps1: "windows8",
            sh: "bash",
            zsh: "bash",
            cr: "crystal",
            scss: "sass",
            gd: "godot",
            tscn: "godot",
            tres: "godot",
            vue: "vuejs",
            h: "c",
            mod: "go",
            sum: "go",
            tex: "latex",
            html: "html5",
            css: "css3",
            jsx: "react",
            tsx: "react",
            kt: "kotlin",
            md: "markdown",
        }[langshort] ?? langshort;
    return \`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/\${name}/\${name}-original.svg\`;
}

function getDefaultImageURL() {
    return "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg";
}
`;
