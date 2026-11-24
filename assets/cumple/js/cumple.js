/* ═══ Cumpleaños — la película y el álbum leen todo de cumple.json ═══ */
const IMG = (n) => `assets/cumple/img/${n}.jpg`;
const $ = (id) => document.getElementById(id);

let DATA, audios = [], current = -1, rafId = null, playing = false;

fetch("assets/cumple/data/cumple.json")
    .then((r) => r.json())
    .then((d) => { DATA = d; montarPagina(); prepararPelicula(); });

/* ── INTRO ── */
$("blow-btn").addEventListener("click", () => {
    // Desbloquea todos los audios dentro del mismo click (requisito de iOS/Android)
    audios.forEach((a) => { a.muted = true; a.play().then(() => { a.pause(); a.currentTime = 0; a.muted = false; }).catch(() => {}); });
    $("flame").classList.add("out");
    $("smoke").classList.add("go");
    confeti();
    setTimeout(() => { $("intro").classList.add("hide"); iniciarPelicula(); }, 1300);
});

/* ── PELÍCULA ── */
function prepararPelicula() {
    const bars = $("film-bars");
    DATA.pelicula.forEach((c) => {
        const a = new Audio(c.audio);
        a.preload = "auto";
        audios.push(a);
        bars.insertAdjacentHTML("beforeend", "<span><i></i></span>");
    });
    DATA.pelicula.flatMap((c) => c.fotos).forEach((f) => { if (f.foto) new Image().src = IMG(f.foto); });
}

function iniciarPelicula() {
    document.body.classList.add("locked");
    $("film").classList.add("on");
    $("film-bars").querySelectorAll("i").forEach((i) => (i.style.width = "0"));
    playing = true;
    capitulo(0);
}

function capitulo(i) {
    if (i >= DATA.pelicula.length) return terminarPelicula();
    current = i;
    const c = DATA.pelicula[i];
    [...$("film-bars").children].forEach((b, k) => (b.firstChild.style.width = k < i ? "100%" : "0"));
    audios.forEach((a, k) => k !== i && a.pause());
    const stage = $("film-stage");
    stage.innerHTML = "";
    $("film-chapter").textContent = `${c.cancion} · ${c.artista}`;

    // Diapositiva 0 = título del capítulo; las demás, las fotos
    const slides = [{ titulo: true }, ...c.fotos];
    slides.forEach((s, k) => {
        const el = document.createElement("div");
        const dur = (c.cortes[k + 1] ?? c.duracion) - c.cortes[k];
        el.style.setProperty("--dur", dur + 1.5 + "s");
        if (s.titulo || s.final) {
            el.className = "slide titulo" + (s.final ? " final" : "");
            el.innerHTML = s.final
                ? `<p class="t-num">${s.pie}</p><h3 class="t-cancion">${s.titulo}</h3><p class="t-artista">— ${DATA.de}</p>`
                : `<p class="t-num">Capítulo ${i + 1}</p><h3 class="t-cancion">${c.cancion}</h3><p class="t-artista">${c.artista}</p><p class="t-frase">${c.frase}</p>`;
        } else {
            el.className = `slide ${s.modo || "suave"}`;
            el.innerHTML = `<img src="${IMG(s.foto)}" alt="">${s.pie ? `<p class="pie">${s.pie}</p>` : ""}`;
        }
        stage.appendChild(el);
    });

    const a = audios[i];
    a.currentTime = 0;
    a.volume = 1;
    a.play().catch(() => {});
    const t0 = performance.now();
    let shown = -1;

    cancelAnimationFrame(rafId);
    const tick = () => {
        // El reloj es la canción: si el audio está sonando, manda él; si no, el reloj del navegador
        const t = !a.paused && a.currentTime > 0 ? a.currentTime : (performance.now() - t0) / 1000;
        let k = 0;
        while (k + 1 < c.cortes.length && t >= c.cortes[k + 1]) k++;
        if (k !== shown) {
            stage.children[shown]?.classList.remove("show");
            stage.children[k].classList.add("show");
            const s = slides[k];
            $("film-bg").style.backgroundImage = s.foto ? `url(${IMG(s.foto)})` : "none";
            shown = k;
        }
        $("film-bars").children[i].firstChild.style.width = Math.min(100, (t / c.duracion) * 100) + "%";
        if (t >= c.duracion) return capitulo(i + 1);
        if (playing) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
}

function terminarPelicula() {
    playing = false;
    cancelAnimationFrame(rafId);
    audios.forEach((a) => a.pause());
    $("film").classList.remove("on");
    document.body.classList.remove("locked");
    $("page").classList.add("on");
    $("music-btn").classList.add("show");
    window.scrollTo(0, 0);
}

$("film-skip").addEventListener("click", terminarPelicula);
$("replay-btn").addEventListener("click", iniciarPelicula);

// Botón flotante: vuelve a sonar "Perfect" en bucle mientras recorre el álbum
const fondo = () => audios.find((_, i) => DATA.pelicula[i].id === "perfect");
$("music-btn").addEventListener("click", () => {
    const a = fondo();
    if (a.paused) { a.loop = true; a.currentTime = 0; a.play(); $("music-btn").textContent = "❚❚"; }
    else { a.pause(); $("music-btn").textContent = "♪"; }
});

/* ── PÁGINA ── */
function montarPagina() {
    const hoy = new Date();
    const { dia, mes } = DATA.cumple;
    const esHoy = hoy.getDate() === dia && hoy.getMonth() + 1 === mes;
    $("intro-fecha").textContent = esHoy ? "Hoy es tu día" : `${dia} · ${mes}`;
    $("intro-nombre").textContent = $("hero-nombre").textContent = DATA.nombre;
    $("hero-anio").textContent = `Cumpleaños ${hoy.getFullYear()}`;

    const s = DATA.sonrisa;
    $("sonrisa-titulo").textContent = s.titulo;
    $("sonrisa-texto").textContent = s.texto;
    $("sonrisa-fotos").innerHTML = s.fotos
        .map((f) => `<figure><img src="${IMG(f.foto)}" alt="" loading="lazy"><figcaption>${f.pie}</figcaption></figure>`)
        .join("");

    // Álbum agrupado por año: agregar un recuerdo = agregar un objeto al JSON
    const porAnio = {};
    DATA.album.forEach((f) => (porAnio[f.anio] ??= []).push(f));
    $("album-years").innerHTML = Object.keys(porAnio).sort().map((anio) => `
        <h3 class="anio">${anio}</h3>
        <div class="grid">${porAnio[anio].map((f, i) => `
            <figure class="polaroid" style="--r:${(i % 2 ? 1 : -1) * (1 + (i % 3))}deg" data-foto="${f.foto}" data-pie="${f.pie}">
                <img src="${IMG(f.foto)}" alt="${f.pie}" loading="lazy"><p>${f.pie}</p>
            </figure>`).join("")}
        </div>`).join("");

    const obs = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("visible")), { threshold: 0.1 });
    document.querySelectorAll(".polaroid").forEach((p) => {
        obs.observe(p);
        p.addEventListener("click", () => {
            $("lightbox-img").src = IMG(p.dataset.foto);
            $("lightbox-pie").textContent = p.dataset.pie;
            $("lightbox").classList.add("on");
        });
    });
    $("lightbox").addEventListener("click", () => $("lightbox").classList.remove("on"));

    const m = DATA.mensaje;
    $("mensaje").innerHTML = m.map((p) => `<p>${p}</p>`).join("") + `<p class="firma">— ${DATA.de}</p>`;
}

/* ── CONFETI ── */
function confeti() {
    const colores = ["#f3c84b", "#d99a2b", "#d97a86", "#fff4df", "#f6dfa0"];
    for (let i = 0; i < 90; i++) {
        const p = document.createElement("div");
        const size = 6 + Math.random() * 8;
        Object.assign(p.style, {
            position: "fixed", zIndex: 3500, top: "-12px", left: Math.random() * 100 + "vw",
            width: size + "px", height: size * 0.6 + "px", background: colores[i % colores.length],
            borderRadius: "2px", pointerEvents: "none",
        });
        document.body.appendChild(p);
        p.animate(
            [{ transform: "translateY(0) rotate(0)", opacity: 1 },
             { transform: `translateY(105vh) rotate(${720 * Math.random()}deg)`, opacity: 0.2 }],
            { duration: 2200 + Math.random() * 2000, delay: Math.random() * 600, easing: "cubic-bezier(.2,.6,.4,1)" }
        ).onfinish = () => p.remove();
    }
}
