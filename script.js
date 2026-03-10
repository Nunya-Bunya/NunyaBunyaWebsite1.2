/* ═══════════════════════════════════════════
   NUNYA BUNYA — JavaScript Functionality
   ═══════════════════════════════════════════ */

// ═══════════ NAV SCROLL EFFECT ═══════════
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

// ═══════════ MOBILE NAV TOGGLE ═══════════
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close mobile nav when a link is clicked
const navLinksItems = navLinks.querySelectorAll('a');
navLinksItems.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

// ═══════════ UPDATE ACTIVE NAV LINK ═══════════
function updateActiveLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  navLinksItems.forEach(link => {
    link.classList.remove('active');

    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// Run on page load
updateActiveLink();

// ═══════════ SMOOTH SCROLL BEHAVIOR ═══════════
// Already handled by CSS: html { scroll-behavior: smooth; }
// This function adds additional support if needed
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});

// ═══════════ FADE-IN ANIMATION ON SCROLL ═══════════
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Apply fade-in animation to sections
const sections = document.querySelectorAll('.section, .portfolio-item, .card, .package');
sections.forEach(section => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(20px)';
  section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(section);
});

// ═══════════ FORM SUBMISSION HANDLING ═══════════
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    // Formspree handles the actual submission
    // This is just a fallback for tracking or custom behavior if needed
    console.log('Form submitted');
  });
}

// ═══════════ KEYBOARD SHORTCUTS ═══════════
document.addEventListener('keydown', (e) => {
  // Close mobile nav on Escape key
  if (e.key === 'Escape' && navLinks.classList.contains('open')) {
    navLinks.classList.remove('open');
  }
});
