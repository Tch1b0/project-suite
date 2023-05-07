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
    img.src =
        "https://logos-download.com/wp-content/uploads/2019/01/JavaScript_Logo.png";
    div.appendChild(img);

    const p = document.createElement("h2");
    p.textContent = project.name;
    div.appendChild(p);

    return div;
}
