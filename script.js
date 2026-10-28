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

/* ============ 3D TERMINAL — LIVE TROUBLESHOOTING ============ */
const termBody = document.getElementById("termBody");
const term3d = document.getElementById("term3d");

// Real desktop-support session: command -> outputs, loops forever
const session = [
  { cmd: "ipconfig /all", out: [["dim", "    IPv4 Address . . . : 192.168.1.24"], ["info", "    Adapter status . . : Connected"]], ok: "Network adapter : OK" },
  { cmd: "ping 8.8.8.8 -n 4", out: [["dim", "    Reply from 8.8.8.8: time=12ms"], ["dim", "    Reply from 8.8.8.8: time=11ms"]], ok: "Internet latency : PASS" },
  { cmd: "chkdsk C: /f", out: [["dim", "    Stage 1: Examining basic file system ..."], ["dim", "    No errors found on drive C:"]], ok: "Disk health : OK" },
  { cmd: "cleanmgr /sagerun:1", out: [["dim", "    Removing temporary files ..."], ["dim", "    2.4 GB of clutter cleared"]], ok: "Performance boost : DONE" },
  { cmd: "net stop spooler && net start spooler", out: [["dim", "    Print Spooler service restarted"]], ok: "Printer service : FIXED" },
  { cmd: "sfc /verifyonly", out: [["dim", "    Beginning system scan. This will take some time..."], ["dim", "    Windows Resource Protection did not find violations."]], ok: "System files : VERIFIED" },
  { cmd: "cls && echo Ticket #4821 - Resolved", out: [["info", "    User contacted · Issue closed · Notes saved to ticket"]], ok: "Ticket closed : SLA ON TIME ✔" }
];

let tLine = 0;      // session step
let tPhase = 0;     // within step
let tChar = 0;
let caretEl = null;
const MAX_LINES = 13;

function termType() {
  const step = session[tLine];

  if (tPhase === 0) {
    // create command line, type it char by char
    if (!caretEl) {
      caretEl = document.createElement("div");
      caretEl.className = "tl cmd tl-caret";
      termBody.appendChild(caretEl);
      trim();
    }
    const text = `C:\\PC-Doctor> ${step.cmd}`;
    tChar++;
    const shown = text.slice(0, tChar);
    if (tChar < text.length) {
      caretEl.textContent = shown;
    } else {
      caretEl.textContent = shown;
      caretEl.classList.remove("tl-caret");
    }
    if (tChar >= text.length) {
      caretEl.classList.remove("tl-caret");
      caretEl = null;
      tPhase = 1; tChar = 0;
      setTimeout(termType, 420);
    } else {
      setTimeout(termType, 26 + Math.random() * 34);
    }
  } else if (tPhase <= step.out.length) {
    // print each output line
    const [cls, txt] = step.out[tPhase - 1];
    const el = document.createElement("div");
    el.className = `tl ${cls}`;
    el.textContent = txt;
    termBody.appendChild(el);
    trim();
    tPhase++;
    setTimeout(termType, 560);
  } else {
    // green result line, then next command
    const el = document.createElement("div");
    el.className = "tl ok";
    el.textContent = `✔ ${step.ok}`;
    termBody.appendChild(el);
    trim();
    if (caretEl) { caretEl = null; }
    tLine = (tLine + 1) % session.length;
    tPhase = 0; tChar = 0;
    setTimeout(termType, 1300);
  }
}

function trim() {
  while (termBody.children.length > MAX_LINES) {
    termBody.removeChild(termBody.firstChild);
  }
}

// Start typing once the hero is visible
const termObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      termObserver.disconnect();
      setTimeout(termType, 600);
    }
  });
}, { threshold: 0.2 });
termObserver.observe(termBody);

// 3D mouse-follow on the monitor
if (!isTouch) {
  window.addEventListener("mousemove", (e) => {
    if (!term3d) return;
    const rx = (e.clientY / window.innerHeight - 0.5) * 6;
    const ry = (e.clientX / window.innerWidth - 0.5) * 14;
    term3d.style.setProperty("--rx", (7 - rx).toFixed(2) + "deg");
    term3d.style.setProperty("--ry", (-12 + ry).toFixed(2) + "deg");
  }, { passive: true });
}

/* ============ FOOTER YEAR ============ */
document.getElementById("year").textContent = new Date().getFullYear();
