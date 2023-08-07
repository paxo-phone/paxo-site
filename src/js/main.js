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

// ------------------------------------------
// navbar scrolling animation - @Welpike
// ------------------------------------------
let header = document.querySelector('header'),
    previousScrollPosition = 0

const isScrollingDown = () => {
    let goingDown = false;
    
    let scrollPosition = window.pageYOffset;
    
    if (scrollPosition > previousScrollPosition) {
        goingDown = true;
    }
    
    previousScrollPosition = scrollPosition;
    
    return goingDown;
};

const handleScroll = () => {
    if (isScrollingDown()) {
        if (window.scrollY >= header.offsetHeight){
        header.classList.add("is-hidden");
    }
    } else {
        header.classList.remove("is-hidden");
    }
};

window.addEventListener("scroll", handleScroll);
