/* ============ LOADER ============ */
document.body.classList.add("loading");
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  setTimeout(() => {
    loader.classList.add("done");
    document.body.classList.remove("loading");
  }, 900);
});

/* ============ SCROLL PROGRESS ============ */
const progress = document.getElementById("progress");

/* ============ CURSOR GLOW ============ */
const glow = document.getElementById("glow");
const isTouch = window.matchMedia("(pointer: coarse)").matches;

if (!isTouch) {
  document.addEventListener("mousemove", (e) => {
    glow.style.opacity = "1";
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });
}

/* ============ NAVBAR ============ */
const navbar = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  navLinks.classList.toggle("open");
});

navLinks.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    hamburger.classList.remove("open");
    navLinks.classList.remove("open");
  })
);

/* ============ ACTIVE LINK + PROGRESS ON SCROLL ============ */
const sections = document.querySelectorAll("section[id]");
const links = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {
  // progress bar
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (window.scrollY / max) * 100 + "%";

  // navbar glass
  navbar.classList.toggle("scrolled", window.scrollY > 20);

  // active section
  let current = "home";
  sections.forEach((sec) => {
    if (window.scrollY >= sec.offsetTop - 150) current = sec.id;
  });
  links.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
  });
}, { passive: true });

/* ============ TYPING EFFECT ============ */
const roles = ["IT Helpdesk Support", "Service Desk Analyst", "Desktop Support Engineer", "Hardware Troubleshooter"];
const typedEl = document.getElementById("typed");

let roleIndex = 0;
let charIndex = 0;
let deleting = false;

function typeLoop() {
  const word = roles[roleIndex];
  typedEl.textContent = word.slice(0, charIndex);

  let delay = deleting ? 50 : 100;

  if (!deleting && charIndex === word.length) {
    delay = 1600;
    deleting = true;
  } else if (deleting && charIndex === 0) {
    deleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    delay = 350;
  } else {
    charIndex += deleting ? -1 : 1;
  }

  setTimeout(typeLoop, delay);
}
typeLoop();

/* ============ SCROLL REVEAL ============ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* ============ 3D TILT (desktop only) ============ */
if (!isTouch) {
  document.querySelectorAll(".tilt").forEach((card) => {
    const strength = 8;

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) translateY(-4px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

/* ============ ANIMATED COUNTERS ============ */
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.count;
      const duration = 1400;
      const start = performance.now();

      function update(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + (target >= 10 ? "+" : "");
        if (p < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
      statObserver.unobserve(el);
    });
  },
  { threshold: 0.6 }
);

document.querySelectorAll(".stat-num").forEach((el) => statObserver.observe(el));

/* ============ FOOTER YEAR ============ */
document.getElementById("year").textContent = new Date().getFullYear();
