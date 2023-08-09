// @Welpike

import { getData, Storage } from './utils.js'

function getCurrentStep() {
    let currentStep = Number(Storage.get("current_step")),
        stepsLength = Number(Storage.get("steps_length"))

    if (!currentStep || currentStep < 0 || currentStep > stepsLength) {
        Storage.set("current_step", 0)
        currentStep = 0
    }

    return currentStep
}

function displayStep(step, translations) {
    let h1 = document.querySelector("#step_title"),
        p = document.querySelector("#step_description"),
        iframe = document.querySelector("#step_video"),
        previous = document.querySelector("#step_previous"),
        next = document.querySelector("#step_next"),
        index = getCurrentStep() + 1,
        stepsLength = Number(Storage.get("steps_length"))

    document.title = `${translations.step} ${index} — Paxo`
    h1.textContent = `${step.title}`
    p.innerHTML = ""
    p.insertAdjacentHTML("beforeend", `<p>${step.description}</p>`)
    iframe.setAttribute("src", step.video)

    if (index === 1) {
        previous.setAttribute('onclick', 'redirect("begin")')
        next.removeAttribute('onclick')
        previous.textContent = `${translations.assembly}`
        next.textContent = `${translations.step} ${index + 1}`
    }
    else if (index === stepsLength) {
        next.setAttribute('onclick', 'redirect("end")')
        previous.removeAttribute('onclick')
        previous.textContent = `${translations.step} ${index - 1}`
        next.textContent = `${translations.end}`
    }
    else {
        next.removeAttribute('onclick')
        previous.removeAttribute('onclick')
        previous.textContent = `${translations.step} ${index - 1}`
        next.textContent = `${translations.step} ${index + 1}`
    }
}

async function changeStep(steps, it) {
    let currentStep = getCurrentStep(),
        previous = document.querySelector("#step_previous"),
        next = document.querySelector("#step_next"),
        lang = Storage.get("lang")

    currentStep += it
    Storage.set("current_step", currentStep)
    displayStep(steps[lang]["steps"][currentStep], steps[lang]["translations"])

    return currentStep
}

(async function () {
    const stepsUrl = "/src/js/data/steps.json"
    let steps = await getData(stepsUrl),
        previous = document.querySelector("#step_previous"),
        next = document.querySelector("#step_next"),
        lang = Storage.get("lang")

    displayStep(steps[lang]["steps"][getCurrentStep()], steps[lang]["translations"])
    Storage.set("steps_length", steps[lang]["steps"].length)

    previous.addEventListener("click", () => {
        changeStep(steps, -1)
    })

    next.addEventListener("click", () => {
        changeStep(steps, 1)
    })
})()
