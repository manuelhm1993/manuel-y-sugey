/* SCROLL PROGRESS */
window.addEventListener("scroll", () => {
    const h = document.documentElement;
    document.getElementById("progress").style.width =
        (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + "%";
});

/* LIVE COUNTER desde 27-may-2025 */
function updateCounter() {
    const start = new Date("2025-05-27T00:00:00");
    const now = new Date();
    let diff = Math.max(0, now - start);
    const totalSecs = Math.floor(diff / 1000);
    const totalMins = Math.floor(totalSecs / 60);
    const totalHours = Math.floor(totalMins / 60);
    const totalDays = Math.floor(totalHours / 24);
    const years = Math.floor(totalDays / 365.25);
    const months = Math.floor((totalDays - Math.floor(years * 365.25)) / 30.44);
    const days = Math.floor(
        totalDays - Math.floor(years * 365.25) - Math.floor(months * 30.44),
    );
    document.getElementById("c-years").textContent = years;
    document.getElementById("c-months").textContent = months;
    document.getElementById("c-days").textContent = Math.max(0, days);
    document.getElementById("c-hours").textContent = String(
        totalHours % 24,
    ).padStart(2, "0");
    document.getElementById("c-mins").textContent = String(
        totalMins % 60,
    ).padStart(2, "0");
    document.getElementById("c-secs").textContent = String(
        totalSecs % 60,
    ).padStart(2, "0");
}
updateCounter();
setInterval(updateCounter, 1000);

/* BRIDGE */
const bObs = new IntersectionObserver(
    (entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                document.getElementById("bridge-path").classList.add("drawn");
                bObs.disconnect();
            }
        });
    },
    { threshold: 0.4 },
);
bObs.observe(document.getElementById("bridge-svg"));

/* TIMELINE */
const tlObs = new IntersectionObserver(
    (entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) e.target.classList.add("visible");
        });
    },
    { threshold: 0.12 },
);
document.querySelectorAll(".tl-item").forEach((el) => tlObs.observe(el));

/* FEELINGS */
function toggleFeeling(card) {
    card.classList.toggle("open");
}

/* MUSIC — reemplaza src con la URL real de Perfect (Bocelli & Ed Sheeran) */
let musicPlaying = false;
/* EXPERIENCE START */
function startExperience() {
    const audio = document.getElementById("bg-music");
    const overlay = document.getElementById("welcome");

    audio.play().catch(() => {});
    musicPlaying = true;
    document.getElementById("music-btn").classList.add("playing");
    document.getElementById("music-note").classList.add("spinning");

    overlay.classList.add("hide");
    setTimeout(() => overlay.remove(), 900);
}

/* MUSIC TOGGLE (botón flotante) */
function toggleMusic() {
    const audio = document.getElementById("bg-music");
    const btn = document.getElementById("music-btn");
    const note = document.getElementById("music-note");
    if (!musicPlaying) {
        audio.play().catch(() => {});
        musicPlaying = true;
        btn.classList.add("playing");
        note.classList.add("spinning");
    } else {
        audio.pause();
        musicPlaying = false;
        btn.classList.remove("playing");
        note.classList.remove("spinning");
    }
}

/* AUTOPLAY al cargar */
window.addEventListener("load", () => {
    document
        .getElementById("bg-music")
        .play()
        .then(() => {
            musicPlaying = true;
            document.getElementById("music-btn").classList.add("playing");
            document.getElementById("music-note").classList.add("spinning");
        })
        .catch(() => {
            /* El navegador bloqueó el autoplay, el usuario da click manual */
        });
});

/* CARTA */
function toggleCarta() {
  document.getElementById('carta-overlay').classList.toggle('visible');
  document.body.style.overflow =
    document.getElementById('carta-overlay').classList.contains('visible')
    ? 'hidden' : '';
}

function cerrarCarta(e) {
  if (e.target === document.getElementById('carta-overlay')) toggleCarta();
}