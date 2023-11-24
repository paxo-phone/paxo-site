import "../scss/styles.scss"

const logo = document.querySelector('.logo')
const toggleNavBtn = document.querySelector('.toggle-nav-btn')
const responsiveNavItems = document.querySelectorAll('.responsive-nav-item');
const navLinks = document.querySelectorAll('.nav-item');
const nav = document.querySelector('.nav');

/// Header-related stuff
// Navbar button
if (toggleNavBtn) {
  toggleNavBtn.addEventListener("click", () => {
    let responsiveNav = document.querySelector(".responsive-nav")

    responsiveNavItems.forEach((responsiveNavItem, index) => {
      setTimeout(() => {
        responsiveNavItem.classList.toggle('active');
      }, 100 * (index + 1))
    })

    if (responsiveNav) {
      responsiveNav.classList.toggle("active")
      toggleNavBtn.classList.toggle("active")
    }
  })
}

// See resources/scss/layout/_header.scss:128
// Header animations
// window.addEventListener('load', () => {
//   setTimeout(() => {
//     logo.classList.add('visible');
//   }, 400)

//   setTimeout(() => {
//     toggleNavBtn.classList.add('visible');
//   }, 800)


//   if (nav.style.display != "none") {
//     navLinks.forEach((navLink, index) => {
//       setTimeout(() => {
//         navLink.classList.add('visible');
//       }, 100 * (index + 1))
//     })
//   }
// })

// Language board
const lang_select = document.querySelector("#lang-select")
const lang_toggle = document.querySelector("#lang-current")

function modalCloseListener(ev) {
  if (!ev.target.closest('.lang-select-wrapper')) {
    lang_select.classList.remove("open")
    document.removeEventListener('click', modalCloseListener)
  }
}

lang_toggle.onclick = () => {
  if (!lang_select.classList.contains("open")) {
    lang_select.classList.add("open")

    document.addEventListener('click', modalCloseListener)
  }
}
