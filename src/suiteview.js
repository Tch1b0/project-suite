// imports
const vscode = acquireVsCodeApi();

// elements
const statusMessage = document.getElementById("statusMessage");
const projectContainer = document.getElementById("projectContainer");

// variables
let projects = [];

updateStatusMessage();

window.addEventListener("message", (ev) => {
    projects = ev.data;
    state = "finished";
    updateProjects();
});

function updateStatusMessage() {
    if (projects.length === 0) {
        statusMessage.textContent = "Loading...";
    } else {
        statusMessage.textContent = "";
    }
}

function updateProjects() {
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
    img.src =
        "https://logos-download.com/wp-content/uploads/2019/01/JavaScript_Logo.png";
    div.appendChild(img);

    const p = document.createElement("h2");
    p.textContent = project.name;
    div.appendChild(p);

    return div;
}
