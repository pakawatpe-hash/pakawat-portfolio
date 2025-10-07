// ===== ข้อมูลใบเกียรติบัตร =====
const CERTS = [
  { title: "Algorithm & Data Structures", file: "assets/certs/cert-01.jpg", category: "programming" },
  { title: "Python Automation Workshop",  file: "assets/certs/cert-02.jpg", category: "programming" },
  { title: "Flutter App Dev Bootcamp",    file: "assets/certs/cert-03.jpg", category: "mobile" },
  { title: "Mobile UI Best Practices",    file: "assets/certs/cert-04.jpg", category: "mobile" },
  { title: "Intro to Machine Learning",   file: "assets/certs/cert-05.jpg", category: "ai" },
  { title: "Data Analysis with Pandas",   file: "assets/certs/cert-06.jpg", category: "ai" },
  { title: "SQL for Developers",          file: "assets/certs/cert-07.jpg", category: "programming" },
  { title: "Cybersecurity Basics",        file: "assets/certs/cert-08.jpg", category: "other" },
  { title: "Git & GitHub",                file: "assets/certs/cert-09.jpg", category: "programming" },
  { title: "Problem Solving Certificate", file: "assets/certs/cert-10.jpg", category: "other" },
];

const grid = document.getElementById("certGrid");
const filters = document.querySelectorAll(".chip");
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbClose = document.querySelector(".lb-close");
const dlBtn = document.getElementById("dlBtn");
const backdrop = document.querySelector(".lb-backdrop");

// ===== Populate Grid =====
function populate(filter = "all") {
  grid.innerHTML = "";
  const list = filter === "all" ? CERTS : CERTS.filter(c => c.category === filter);
  list.forEach(cert => {
    const card = document.createElement("div");
    card.className = "cert-card";
    card.innerHTML = `
      <img src="${cert.file}" alt="${cert.title}" class="cert-thumb" loading="lazy">
      <div class="cert-meta">
        <div class="cert-title">${cert.title}</div>
        <div class="cert-actions">
          <button class="btn tiny" data-view>ดู</button>
          <a href="${cert.file}" download class="btn tiny ghost">ดาวน์โหลด</a>
        </div>
      </div>
    `;
    card.querySelector("[data-view]").addEventListener("click", () => openLightbox(cert));
    grid.appendChild(card);
  });
}

// ===== Filter Buttons =====
filters.forEach(btn => {
  btn.addEventListener("click", () => {
    filters.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    populate(btn.dataset.filter);
  });
});

// ===== Lightbox =====
function openLightbox(cert) {
  lbImg.src = cert.file;
  lbImg.alt = cert.title;
  dlBtn.href = cert.file;
  dlBtn.download = cert.title.replace(/\s+/g, "_") + ".jpg";
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
}
function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
}

// Events
lbClose.addEventListener("click", closeLightbox);
backdrop.addEventListener("click", closeLightbox);
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
});

// Init
populate("all");
