import "../scss/styles.scss"

const logo = document.querySelector('.logo')
const navLinks = document.querySelectorAll('.dash-nav-item');
const nav = document.querySelector('.dash-navbar');


//Animations au chargement de la page

window.addEventListener('load', (e) => {

    setTimeout(() => {

        logo.classList.add('visible');

    }, 400)

    setTimeout(() => {

        toggleNavBtn.classList.add('visible');

    }, 800)


    if (nav.style.display === "none") {


    } else {


        navLinks.forEach((navLink, index) => {

            setTimeout(() => {

                navLink.classList.add('visible');

            }, 100 * (index + 1))

        })

    }

})
