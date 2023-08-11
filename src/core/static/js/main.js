const logo=document.querySelector('.logo')
const toggleNavBtn=document.querySelector('.toggle-nav-btn')
const responsiveNavItems=document.querySelectorAll('.responsive-nav-item');
const navLinks=document.querySelectorAll('.nav-item');
const nav=document.querySelector('.nav');

if (toggleNavBtn)
{
    toggleNavBtn.addEventListener("click", (e) =>
    {
        let responsiveNav = document.querySelector(".responsive-nav")
        
        responsiveNavItems.forEach((responsiveNavItem, index)=>{

            setTimeout(()=>{

                responsiveNavItem.classList.toggle('active');

            },100*(index+1))

        })

        if(responsiveNav)
        {
            responsiveNav.classList.toggle("active")
            toggleNav.classList.toggle("active")

        }

    })
}

//Animations au chargement de la page

window.addEventListener('load',(e)=>{
    
    setTimeout(()=>{

        logo.classList.add('visible');

    },400)

    setTimeout(()=>{

        toggleNavBtn.classList.add('visible');

    },800)

  
 if(nav.style.display==="none"){


 }else {


    navLinks.forEach((navLink,index)=>{

        setTimeout(()=>{

            navLink.classList.add('visible');

        },100*(index+1))

    })

 }

})