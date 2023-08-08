let toggleNav = document.querySelector(".toggle-nav-btn")

if (toggleNav)
{
    toggleNav.addEventListener("click", (e) =>
    {
        let responsiveNav = document.querySelector(".responsive-nav")
        if(responsiveNav)
        {
            responsiveNav.classList.toggle("active")
            toggleNav.classList.toggle("active")
        }

    })
}

// ------------------------------------------------------------------------------------
// "website in developpment" banner - @Welpike
// ------------------------------------------------------------------------------------
/**
 * Create element from a string (for elements contained in a string)
 * @param {string} str The string with HTML in it
 * @returns {ChildNode}
 */
Document.prototype.createElementFromString = function (str) {
    const element = new DOMParser().parseFromString(str, 'text/html')
    return element.documentElement.querySelector('body').firstChild
};

let bannerHTML = `<div id="banner"><p>This project is under development. You can follow the evolution of it on <a href="https://github.com/paxo-rch">GitHub</a>.</p></div>`,
    banner = document.createElementFromString(bannerHTML)

document.body.prepend(banner)
document.body.style.position = "relative"
document.querySelector("header").style.marginTop += banner.offsetHeight + "px"
