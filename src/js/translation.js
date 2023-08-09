// @Welpike

import {getData, langCode, Storage, strToEmoji} from "/src/js/utils.js"


async function process(lang) {
    const TRANSLATIONS = await getData("/src/js/data/languages.json")
    let tags = document.querySelectorAll(`[data-text]`),
        regex = /[a-zA-Z0-9 .,!?]+ <[a-z]/  // this regex verifies if in the text a begin of HTML tag exists
                                                     // (e.g "<a")

    tags.forEach(tag => {
        let text = TRANSLATIONS[lang][tag.getAttribute("data-text")]
        if (text.match(regex)) {
            tag.innerHTML = ""
            tag.insertAdjacentHTML("beforeend", text)
        } else {
            tag.innerText = text
        }
    })
}

async function translate(newLang) {
    await process(newLang)
    Storage.set("lang", newLang)
}

async function displayOptions() {
    const TRANSLATIONS = await getData("/src/js/data/languages.json")
    let options = []

    for(let lang in TRANSLATIONS) {
        let newOption = document.createElement("option")

        newOption.innerText = strToEmoji(lang)
        newOption.setAttribute("value", lang)

        if (lang === Storage.get("lang")) {
            newOption.setAttribute("selected", "")
        }

        options.push(newOption)
    }
    return options
}

(async function () {
    let currentLang = Storage.get("lang") ? Storage.get("lang") : langCode(),
        select = document.querySelector("#lang"),
        selectResponsive = document.querySelector("#lang_responsive"),
        options = await displayOptions()

    for (const option of options) {
        select.appendChild(option)
        selectResponsive.appendChild(option.cloneNode(true))

        select.addEventListener("click", async () => {
            await translate(select.selectedOptions[0].getAttribute("value"))
        })
    }

    await translate(currentLang)
})()
