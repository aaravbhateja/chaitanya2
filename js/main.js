import { GYM, STATS, COACHES, FLOORS, PLANS, GALLERY } from "./data.js";
import { initScene } from "./scene.js";

const $ = (s, r = document) => r.querySelector(s);
const inr = (n) => n.toLocaleString("en-IN");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Photo element that falls back to a labelled placeholder if the file is missing
function photo(src, label, alt = "") {
  const el = document.createElement("div");
  el.className = "ph";
  el.dataset.label = label;
  const img = new Image();
  img.alt = alt || label;
  img.loading = "lazy";
  img.onerror = () => el.classList.add("missing");
  img.src = src;
  el.append(img);
  return el;
}

/* ---------- content ---------- */
$("#tagline").textContent = GYM.tagline;
$("#vAddr").textContent = GYM.address;
$("#vHours").textContent = GYM.hours;
$("#vPhone").textContent = GYM.phone;
$("#vPhone").href = "tel:" + GYM.phone.replace(/\s/g, "");
$("#vIg").href = GYM.instagram;
$("#vMap").href = GYM.maps;
$("#yr").textContent = new Date().getFullYear();

// hero title: wrap each line for the slide-up reveal
const ht = $("#heroTitle");
ht.innerHTML = ht.innerHTML.split("<br>").map((l, i) => `<span class="line"><span style="animation-delay:${1.0 + i * 0.12}s">${l}</span></span>`).join("");

$("#stats").innerHTML = STATS.map((s) => `<div class="stat reveal"><b data-to="${s.value}" data-suf="${s.suffix}">0</b><span>${s.label}</span></div>`).join("");

const gal = $("#gallery");
GALLERY.forEach((src, i) => {
  const p = photo(src, `Drop photo<br>gallery-${i + 1}.jpg`.replace("<br>", " · "));
  p.classList.add("reveal");
  p.style.setProperty("--d", i * 0.08 + "s");
  gal.append(p);
});

const cg = $("#coachGrid");
COACHES.forEach((c, i) => {
  const b = document.createElement("button");
  b.className = "coach reveal";
  b.style.setProperty("--d", i * 0.08 + "s");
  b.setAttribute("aria-label", `Read about ${c.name}`);
  b.append(photo(c.photo, c.photo.split("/").pop(), c.name));
  const info = document.createElement("div");
  info.className = "coach-info";
  info.innerHTML = `<h3>${c.name}</h3><p>${c.role}</p><span>View profile →</span>`;
  b.append(info);
  b.addEventListener("click", () => openCoach(c));
  cg.append(b);
});

const ft = $("#floorsTrack");
FLOORS.forEach((f) => {
  const d = document.createElement("article");
  d.className = "floor";
  d.append(photo(f.photo, f.photo.split("/").pop(), f.title));
  const info = document.createElement("div");
  info.className = "floor-info";
  info.innerHTML = `<div class="floor-n">${f.n}</div><h3>${f.title}</h3><em>${f.sub}</em><p>${f.text}</p><ul class="chips">${f.tags.map((t) => `<li>${t}</li>`).join("")}</ul>`;
  d.append(info);
  ft.append(d);
});

$("#planGrid").innerHTML = PLANS.map((p, i) => `
  <div class="plan reveal ${p.featured ? "featured" : ""}" style="--d:${i * 0.1}s">
    ${p.featured ? '<span class="badge">Most popular</span>' : ""}
    <h3>${p.name}</h3><div class="dur">${p.duration}</div>
    <div class="price"><sup>₹</sup>${inr(p.price)}</div>
    <div class="per">${p.per}</div>
    <ul>${p.perks.map((x) => `<li>${x}</li>`).join("")}</ul>
    <a href="#visit" class="btn magnetic">Choose ${p.duration}</a>
  </div>`).join("");

/* ---------- coach modal ---------- */
const modal = $("#modal");
let lastFocus;
function openCoach(c) {
  lastFocus = document.activeElement;
  $("#mPhoto").replaceChildren(photo(c.photo, c.photo.split("/").pop(), c.name));
  $("#mRole").textContent = c.role;
  $("#mName").textContent = c.name;
  $("#mBio").textContent = c.bio;
  $("#mYears").textContent = c.years + "+";
  $("#mFocus").innerHTML = c.focus.map((x) => `<li>${x}</li>`).join("");
  $("#mCerts").innerHTML = c.certs.map((x) => `<li>${x}</li>`).join("");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  $("#modalX").focus();
}
function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  lastFocus && lastFocus.focus();
}
$("#modalX").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => e.target === modal && closeModal());
addEventListener("keydown", (e) => e.key === "Escape" && closeModal());

/* ---------- reveal + counters ---------- */
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add("in");
  const b = e.target.querySelector("[data-to]");
  if (b) countUp(b);
  io.unobserve(e.target);
}), { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

function countUp(el) {
  const to = +el.dataset.to, suf = el.dataset.suf || "";
  if (reduce) { el.textContent = to + suf; return; }
  const t0 = performance.now(), dur = 1600;
  (function step(t) {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + suf;
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}

/* ---------- scroll-linked effects ---------- */
const nav = $("#nav"), prog = $("#progress");
const floors = $("#floors"), bar = $("#floorsBar");
let lastY = 0;
function onScroll() {
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  prog.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  nav.classList.toggle("solid", y > 40);
  nav.classList.toggle("hide", y > lastY && y > 400 && !modal.classList.contains("open"));
  lastY = y;

  // floors: vertical scroll -> horizontal travel
  const r = floors.getBoundingClientRect();
  const p = Math.min(Math.max(-r.top / (r.height - innerHeight), 0), 1);
  const travel = Math.max(ft.scrollWidth - (innerWidth - innerWidth * 0.06 - 40), 0);
  ft.style.transform = `translate3d(${-p * travel}px,0,0)`;
  bar.style.transform = `scaleX(${p})`;

  // gentle parallax on gallery columns
  if (!reduce) gal.style.transform = `translateY(${(y - gal.offsetTop) * -0.04}px)`;
}
addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", onScroll);
onScroll();

/* ---------- cursor, magnetic buttons, 3D tilt ---------- */
const cur = $("#cursor");
let cx = 0, cy = 0, tx = 0, ty = 0;
addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; });
(function loop() {
  cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
  cur.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
  requestAnimationFrame(loop);
})();
document.querySelectorAll("a,button").forEach((el) => {
  el.addEventListener("pointerenter", () => cur.classList.add("big"));
  el.addEventListener("pointerleave", () => cur.classList.remove("big"));
});

document.querySelectorAll(".magnetic").forEach((el) => {
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px,${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
  });
  el.addEventListener("pointerleave", () => (el.style.transform = ""));
});

document.querySelectorAll(".coach,.plan").forEach((el) => {
  el.addEventListener("pointermove", (e) => {
    if (!el.classList.contains("in")) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transition = "transform .1s";
    el.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateZ(10px)`;
  });
  el.addEventListener("pointerleave", () => { el.style.transition = ""; el.style.transform = ""; });
});

/* ---------- 3D scene + loader ---------- */
const hudPhase = $("#hudPhase"), hudRep = $("#hudRep");
try {
  initScene($("#bg"), {
    reducedMotion: reduce,
    onRep: ({ phase, rep }) => { hudPhase.textContent = phase; hudRep.textContent = String(Math.max(rep, 1)).padStart(2, "0"); },
  });
} catch (e) { console.warn("WebGL unavailable", e); }
addEventListener("load", () => setTimeout(() => $("#loader").classList.add("done"), 900));
