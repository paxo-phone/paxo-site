// @Welpike

import { getData } from './utils.js'

(async function () {
    let projects = await getData("/src/js/projects.json"),
        projectContainer = document.querySelector("#projects_container"),
        projectTemplate = document.querySelector("#project_template")

    projects.forEach((project) => {
        let projectDiv = document.importNode(projectTemplate.content, true),
            projectTitle = projectDiv.querySelector(".card-title"),
            projectDescription = projectDiv.querySelector(".card-description"),
            projectLink = projectDiv.querySelector("a")

        projectTitle.textContent = project.title
        projectDescription.textContent = project.description
        projectLink.setAttribute("href", project.link)
        projectContainer.appendChild(projectDiv)
    });
})()
