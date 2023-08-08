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