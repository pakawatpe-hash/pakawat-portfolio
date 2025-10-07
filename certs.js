/* ====== ตั้งค่ารายการ PDF ของคุณ (10 ใบ) ======
   category: programming | mobile | ai | other
================================================= */
const CERTS = [
  { title: "Algorithm & Data Structures", file: "assets/certs/cert-01.pdf", category: "programming" },
  { title: "Python Automation Workshop",  file: "assets/certs/cert-02.pdf", category: "programming" },
  { title: "Flutter App Dev Bootcamp",    file: "assets/certs/cert-03.pdf", category: "mobile" },
  { title: "Mobile UI Best Practices",    file: "assets/certs/cert-04.pdf", category: "mobile" },
  { title: "Intro to Machine Learning",   file: "assets/certs/cert-05.pdf", category: "ai" },
  { title: "Data Analysis with Pandas",   file: "assets/certs/cert-06.pdf", category: "ai" },
  { title: "SQL for Developers",          file: "assets/certs/cert-07.pdf", category: "programming" },
  { title: "Cybersecurity Basics",        file: "assets/certs/cert-08.pdf", category: "other" },
  { title: "Git & GitHub",                file: "assets/certs/cert-09.pdf", category: "programming" },
  { title: "Problem Solving Certificate", file: "assets/certs/cert-10.pdf", category: "other" },
];

/* ====== เริ่มต้น DOM ====== */
const grid = document.getElementById("certGrid");
const filters = document.querySelectorAll(".cert-filters .chip");

// Lightbox controls
const lightbox = document.getElementById("lightbox");
const lbBackdrop = document.getElementById("lbBackdrop");
const lbClose = document.getElementById("lbClose");
const lbTitle = document.getElementById("lbTitle");
const openRaw = document.getElementById("openRaw");
const downloadPdf = document.getElementById("downloadPdf");
const pdfCanvas = document.getElementById("pdfCanvas");
const pageNumEl = document.getElementById("pageNum");
const pageCountEl = document.getElementById("pageCount");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const zoomInBtn = document.getElementById("zoomIn");
const zoomOutBtn = document.getElementById("zoomOut");

let curDoc = null, curPdf = null, curPage = 1, scale = 1.1, renderTask = null;

/* ====== ยูทิล ====== */
const byCat = (cat) => cat === "all" ? CERTS : CERTS.filter(c => c.category === cat);

function setActiveFilter(btn){
  filters.forEach(b => { b.classList.toggle("active", b === btn); b.setAttribute("aria-selected", b===btn ? "true":"false"); });
}

function clearGrid(){ grid.innerHTML = ""; }

function makeCard(cert){
  const card = document.createElement("article");
  card.className = "cert-card";

  // thumb
  const th = document.createElement("div");
  th.className = "cert-thumb";
  const canvas = document.createElement("canvas");
  canvas.width = 600; canvas.height = 450; // จะถูกปรับตามสเกลจริง
  th.appendChild(canvas);

  // meta
  const meta = document.createElement("div");
  meta.className = "cert-meta";
  const title = document.createElement("div");
  title.className = "cert-title";
  title.textContent = cert.title;
  const actions = document.createElement("div");
  actions.className = "cert-actions";

  const viewBtn = document.createElement("button");
  viewBtn.className = "btn tiny";
  viewBtn.innerHTML = `<i class='bx bx-show'></i> ดู`;
  viewBtn.addEventListener("click", () => openLightbox(cert));

  const dlBtn = document.createElement("a");
  dlBtn.className = "btn tiny ghost";
  dlBtn.href = cert.file;
  dlBtn.download = cert.title.replace(/\s+/g,'_') + ".pdf";
  dlBtn.innerHTML = `<i class='bx bx-download'></i> ดาวน์โหลด`;

  actions.appendChild(viewBtn);
  actions.appendChild(dlBtn);
  meta.appendChild(title);
  meta.appendChild(actions);

  card.appendChild(th);
  card.appendChild(meta);

  // เรนเดอร์หน้าแรกเป็น thumbnail
  renderPdfFirstPage(cert.file, canvas)
    .catch(() => {
      // fallback icon
      th.innerHTML = `<i class="bx bxs-file-pdf pdf-fallback" aria-hidden="true"></i>`;
    });

  return card;
}

/* ====== Render thumbnail ด้วย PDF.js ====== */
async function renderPdfFirstPage(url, canvas){
  const loading = await pdfjsLib.getDocument(url).promise;
  const page = await loading.getPage(1);
  const viewport = page.getViewport({ scale: 0.35 }); // เล็กพอเป็น thumb
  const ctx = canvas.getContext("2d");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: ctx, viewport }).promise;
}

/* ====== สร้างกริดตามตัวกรอง ====== */
function populate(category="all"){
  clearGrid();
  const list = byCat(category);
  if(!list.length){
    grid.innerHTML = `<p class="section-sub">ยังไม่มีเกียรติบัตรในหมวดนี้</p>`;
    return;
  }
  const frag = document.createDocumentFragment();
  list.forEach(cert => frag.appendChild(makeCard(cert)));
  grid.appendChild(frag);
}

/* ====== Lightbox ====== */
async function openLightbox(cert){
  // ปิดงาน render เดิมถ้ามี
  if(renderTask) { try { await renderTask.cancel(); } catch(e){} renderTask = null; }
  curDoc = cert;
  curPage = 1;
  scale = 1.1;
  lbTitle.textContent = cert.title;
  openRaw.href = cert.file;
  downloadPdf.href = cert.file;

  // โหลดเอกสาร
  curPdf = await pdfjsLib.getDocument(cert.file).promise;
  pageCountEl.textContent = curPdf.numPages;

  await renderPage();

  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  // โฟกัสปุ่มปิด เพื่อรองรับคีย์บอร์ด
  lbClose.focus();
}

function closeLightbox(){
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
}

async function renderPage(){
  if(!curPdf) return;
  const page = await curPdf.getPage(curPage);
  const viewport = page.getViewport({ scale });
  const ctx = pdfCanvas.getContext("2d", { alpha:false, desynchronized:true });
  pdfCanvas.width = Math.floor(viewport.width);
  pdfCanvas.height = Math.floor(viewport.height);
  pageNumEl.textContent = curPage;

  if(renderTask) { try { await renderTask.cancel(); } catch(e){} }
  renderTask = page.render({ canvasContext: ctx, viewport });
  await renderTask.promise;
}

/* ====== Events ====== */
filters.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    setActiveFilter(btn);
    populate(btn.dataset.filter);
  }, { passive:true });
});

lbBackdrop.addEventListener("click", closeLightbox, { passive:true });
lbClose.addEventListener("click", closeLightbox, { passive:true });

prevPageBtn.addEventListener("click", async ()=>{
  if(!curPdf) return;
  if(curPage > 1){ curPage--; await renderPage(); }
}, { passive:true });

nextPageBtn.addEventListener("click", async ()=>{
  if(!curPdf) return;
  if(curPage < curPdf.numPages){ curPage++; await renderPage(); }
}, { passive:true });

zoomInBtn.addEventListener("click", async ()=>{
  scale = Math.min(3, scale + 0.15);
  await renderPage();
}, { passive:true });

zoomOutBtn.addEventListener("click", async ()=>{
  scale = Math.max(0.5, scale - 0.15);
  await renderPage();
}, { passive:true });

// คีย์บอร์ด
document.addEventListener("keydown", async (e)=>{
  if(lightbox.classList.contains("open")){
    if(e.key === "Escape") closeLightbox();
    if(e.key === "ArrowRight") { if(curPdf && curPage < curPdf.numPages){ curPage++; await renderPage(); } }
    if(e.key === "ArrowLeft")  { if(curPdf && curPage > 1){ curPage--; await renderPage(); } }
    if(e.key === "+") { scale = Math.min(3, scale + 0.15); await renderPage(); }
    if(e.key === "-") { scale = Math.max(0.5, scale - 0.15); await renderPage(); }
  }
});

// เริ่มต้น
populate("all");
