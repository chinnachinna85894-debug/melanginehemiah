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
  { cmd: "outlook.exe /safe", out: [["warn", "    Outlook started in Safe Mode ..."], ["warn", "    Error 0xCAA20002: sign-in request timed out"]], ok: "Login issue detected" },
  { cmd: "cmdkey /list | findstr Outlook", out: [["dim", "    Target: Office15:OUTLOOK — credentials STALE"]], ok: "Stale credentials found" },
  { cmd: "cmdkey /delete:Office15:OUTLOOK", out: [["dim", "    Stale credentials deleted"]], ok: "Credentials cleared ✔" },
  { cmd: "dsregcmd /refreshcreds", out: [["dim", "    Azure AD token refreshed"], ["dim", "    Re-authenticating with Exchange ..."]], ok: "Outlook login: FIXED ✔" },
  { cmd: "fixost Outlook -repair -resetprofile", out: [["dim", "    Repairing OST cache ..."], ["dim", "    Re-creating mail profile ..."], ["dim", "    Synchronising inbox with Exchange ..."]], ok: "Outlook : REPAIRED ✔" },
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
// ===== Contextual toast for every terminal fix =====
    showToast(`✔ ${step.ok}`);
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

// 3D tilt stays static — no mouse motion

// ===== Realtime clock =====
const clockEl = document.getElementById("liveClock");
function tickClock() {
  const d = new Date();
  clockEl.textContent = `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}
tickClock();
setInterval(tickClock, 1000);

// ===== CPU / RAM live meters =====
const cpuBar = document.getElementById("cpuBar");
const ramBar = document.getElementById("ramBar");
function pulseMeters() {
  cpuBar.style.width = (18 + Math.random() * 55).toFixed(0) + "%";
  ramBar.style.width = (38 + Math.random() * 32).toFixed(0) + "%";
}
pulseMeters();
setInterval(pulseMeters, 900);

// ===== Toast popup every time a ticket closes =====
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg || "✔ Issue fixed · Ticket closed";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}

// ===== Outlook 3D popup — two real stories: connection issue + login issue =====
const o3d = document.getElementById("o3d");
const o3Status = document.getElementById("o3Status");
const o3Bar = document.getElementById("o3Bar");

const oaStories = [
  // Story 1: connectivity
  [
    { cls: "",        note: "⚠ Disconnected — cannot reach server", bar: "0%" },
    { cls: "fixing",  note: "🛠 Repairing OST cache…",               bar: "72%" },
    { cls: "fixed",   note: "✔ Connected — Inbox synced",            bar: "100%", toast: "✔ Outlook fixed · Profile repaired" }
  ],
  // Story 2: login failure
  [
    { cls: "",        note: "❌ Sign-in failed — invalid credentials", bar: "0%" },
    { cls: "fixing",  note: "🛠 Clearing stale credentials…",         bar: "60%" },
    { cls: "fixing",  note: "🔄 Refreshing Azure AD token…",          bar: "90%" },
    { cls: "fixed",   note: "✔ Signed in — Welcome back!",            bar: "100%", toast: "✔ Outlook login fixed ✔" }
  ]
];
let oaRun = 0;

function outlookShow() {
  const story = oaStories[oaRun % oaStories.length];
  oaRun++;

  // reset card
  o3d.classList.remove("fixing", "fixed", "hide");
  o3Bar.style.width = "0%";
  o3Status.textContent = story[0].note;
  o3d.classList.add("pop");

  let delay = 4200;
  for (let i = 1; i < story.length; i++) {
    const s = story[i];
    setTimeout(() => {
      o3d.classList.remove("pop", "fixing", "fixed");
      o3d.classList.add(s.cls);
      o3Status.textContent = s.note;
      o3Bar.style.width = s.bar;
      if (s.toast) showToast(s.toast);
    }, delay);
    delay += i === story.length - 1 ? 5200 : 3800;
  }

  // hide after story ends, then replay with the other story
  setTimeout(() => {
    o3d.classList.remove("fixed");
    o3d.classList.add("hide");
    setTimeout(outlookShow, 5600);
  }, delay);
}
setTimeout(outlookShow, 5000);

// ===== Realtime clock cleanup on leave =====
document.addEventListener("visibilitychange", () => {
  if (document.hidden) tickClock;
});

/* ============ FOOTER YEAR ============ */
document.getElementById("year").textContent = new Date().getFullYear();
