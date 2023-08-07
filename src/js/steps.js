// for more infos about this code, ping @Welpike on the discord

async function getData(url) {
    const response = await fetch(url);
    return response.json();
}

function redirect(entry) {
    localStorage.removeItem("current_step")

    if (entry == "begin") {
        location.href = "/src/html/assembly.html"
    }
    else if (entry == "end") {
        location.href = "/src/html/step-end.html"
    }
}

function getCurrentStep() {
    let currentStep = Number(localStorage.getItem("current_step"))

    if (!currentStep || currentStep < 0) {
        localStorage.setItem("current_step", 0)
        currentStep = 0
    }

    return currentStep
}

function displayStep(step) {
    let h1 = document.querySelector("#step_title"),
        p = document.querySelector("#step_description"),
        iframe = document.querySelector("#step_video"),
        previous = document.querySelector("#step_previous"),
        next = document.querySelector("#step_next"),
        index = getCurrentStep() + 1

    document.title = `Étape ${index} — Paxo`
    h1.textContent = `${step.title}`
    p.innerHTML = ""
    p.insertAdjacentHTML("beforeend", `<p>${step.description}</p>`)
    iframe.setAttribute("src", step.video)

    if (index == 1) {
        previous.setAttribute('onclick', 'redirect("begin")')
        next.removeAttribute('onclick')
        previous.textContent = `Montage`
        next.textContent = `Étape ${index + 1}`
    }
    else if (index == 5) {
        next.setAttribute('onclick', 'redirect("end")')
        previous.removeAttribute('onclick')
        previous.textContent = `Étape ${index - 1}`
        next.textContent = `Fin`
    }
    else {
        next.removeAttribute('onclick')
        previous.removeAttribute('onclick')
        previous.textContent = `Étape ${index - 1}`
        next.textContent = `Étape ${index + 1}`
    }
}

async function changeStep(steps, it) {
    let currentStep = getCurrentStep(),
        previous = document.querySelector("#step_previous"),
        next = document.querySelector("#step_next")

    currentStep += it
    localStorage.setItem("current_step", currentStep)
    displayStep(steps[currentStep])

    return currentStep
}

(async function () {
    const stepsUrl = "/src/js/steps.json"
    let steps = await getData(stepsUrl),
        previous = document.querySelector("#step_previous"),
        next = document.querySelector("#step_next")

    displayStep(steps[getCurrentStep()])

    previous.addEventListener("click", () => {
        changeStep(steps, -1)
    })

    next.addEventListener("click", () => {
        changeStep(steps, 1)
    })
})()