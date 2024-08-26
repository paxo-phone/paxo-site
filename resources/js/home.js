textPresentation = document.querySelector('.presentation');

window.addEventListener('load', (e) => {

  setTimeout(() => {

    textPresentation.classList.add('visible');

  }, 100)


})

//#region Header scroll transformation

const header = document.querySelector('header.header');

/**
 * We watch the position of the vertical scroll of the page.
 * If it exceeds a certain point, we activate/deactivate the scroll mode of the header.
 */
window.addEventListener("scroll", () => {
  checkHeaderOnScroll();
});

function checkHeaderOnScroll() {
  const BREAK_POINT = 60;
  const CLASS = "top";
  if (window.scrollY > BREAK_POINT) {
    if (header.classList.contains(CLASS)) {
      header.classList.remove(CLASS);
    }
  }
  else {
    if (!header.classList.contains(CLASS)) {
      header.classList.add(CLASS);
    }
  }
}
checkHeaderOnScroll();

//#endregion
