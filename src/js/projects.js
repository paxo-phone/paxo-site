// @Welpike

import {getData, Storage} from './utils.js'

(async function () {
    let projects = await getData("/src/js/data/projects.json"),
        projectContainer = document.querySelector("#projects_container"),
        projectTemplate = document.querySelector("#project_template"),
        lang = Storage.get("lang")

    projects[lang]["projects"].forEach((project) => {
        let projectDiv = document.importNode(projectTemplate.content, true),
            projectTitle = projectDiv.querySelector(".card-title"),
            projectDescription = projectDiv.querySelector(".card-description"),
            projectLink = projectDiv.querySelector("a")

        projectTitle.textContent = project.title
        projectDescription.textContent = project.description
        projectLink.textContent = projects[lang]["translations"]["learn_more"]
        projectLink.setAttribute("href", project.link)
        projectContainer.appendChild(projectDiv)
    });
})()
