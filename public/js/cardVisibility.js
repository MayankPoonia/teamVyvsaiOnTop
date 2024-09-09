document.addEventListener("DOMContentLoaded", function () {
  const heroSection = document.querySelector(".hero-section");
  heroSection.classList.add("visible");
});

document.addEventListener("scroll", function () {
  const sections = document.querySelectorAll(
    ".mission-section, .services-section, .values-section, .testimonials-section"
  );
  const triggerBottom = (window.innerHeight / 5) * 4;

  sections.forEach((section) => {
    const sectionTop = section.getBoundingClientRect().top;

    if (sectionTop < triggerBottom) {
      section.classList.add("visible");
    }
  });
});
