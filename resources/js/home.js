const header_options = (delay) => {
  return {
    delay: delay + 50,
    duration: 500,
    origin: 'bottom',
    distance: '20px',
    opacity: 0,
    easing: 'cubic-bezier(0.5, 0, 0, 1)',
    reset: true
  }
}

window.addEventListener('load', (e) => {
  // Élements du header
  ScrollReveal().reveal('.reveal-over_title', header_options(0));
  ScrollReveal().reveal('.reveal-title', header_options(100));
  ScrollReveal().reveal('.reveal-description', header_options(200));
  ScrollReveal().reveal('.reveal-button', header_options(300));

  // Sections 
  ScrollReveal().reveal('.reveal-section-title', {
    delay: 50,
    duration: 500,
    origin: 'bottom',
    distance: '20px',
    scale: 0.95,
    opacity: 0,
    easing: 'cubic-bezier(0.5, 0, 0, 1)',
    reset: false
  });

  ScrollReveal().reveal('.reveal-section-text', {
    delay: 150,
    duration: 500,
    origin: 'bottom',
    distance: '20px',
    scale: 0.95,
    opacity: 0,
    easing: 'cubic-bezier(0.5, 0, 0, 1)',
    reset: false
  });
})
