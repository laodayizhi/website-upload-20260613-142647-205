(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      const opened = mobilePanel.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let activeSlide = 0;
  let slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
      dot.setAttribute('aria-current', dotIndex === activeSlide ? 'true' : 'false');
    });
  }

  function startSlides() {
    if (slides.length <= 1) {
      return;
    }

    slideTimer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      if (slideTimer) {
        window.clearInterval(slideTimer);
      }
      showSlide(index);
      startSlides();
    });
  });

  showSlide(0);
  startSlides();

  const filterInput = document.querySelector('[data-page-filter]');
  const cards = Array.from(document.querySelectorAll('[data-card-text]'));

  if (filterInput && cards.length) {
    filterInput.addEventListener('input', function () {
      const keyword = filterInput.value.trim().toLowerCase();
      cards.forEach(function (card) {
        const text = (card.getAttribute('data-card-text') || '').toLowerCase();
        card.style.display = !keyword || text.includes(keyword) ? '' : 'none';
      });
    });
  }
})();
