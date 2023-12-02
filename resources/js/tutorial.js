/**
 * Nota: this script is used for legal part too. - Welpike
 */

import "../scss/module/markdown.scss"

import markdownIt from "markdown-it"
import hljs from "highlight.js"

const doc = document.querySelector(".markdown-body")

const md = markdownIt({
  html: true,
  linkify: true,
  typographer: true,

  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch { return }
    }

    return ''; // use external default escaping
  }
})
doc.innerHTML = md.render(doc.textContent)
document.querySelectorAll("table").forEach((el) => el.classList.add('table'))
doc.removeAttribute('style')
