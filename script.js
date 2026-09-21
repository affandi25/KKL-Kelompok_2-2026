// ==========================================
// AUTO MIGRATE ASSETS KE SUPABASE
// ==========================================
// GANTI DENGAN BASE URL KAMU DARI LANGKAH 1 (JANGAN ADA TANDA / DI AKHIR)
const SUPABASE_BASE_URL = "https://pwvegvjtocalpazfnazr.supabase.co/storage/v1/object/public/foto";

function resolveSupabaseUrl(path) {
  if (!path || !path.includes("asset/")) return path;
  const fileName = path.split("asset/")[1].trim();
  return `${SUPABASE_BASE_URL}/${encodeURIComponent(fileName)}`;
}

// 1. Ganti semua <img>
document.querySelectorAll("img[src*='asset/']").forEach((img) => {
  img.src = resolveSupabaseUrl(img.getAttribute("src"));
});

// 2. Ganti atribut data-img untuk Modal Lokasi
document.querySelectorAll(".show-card[data-img*='asset/']").forEach((card) => {
  card.setAttribute("data-img", resolveSupabaseUrl(card.getAttribute("data-img")));
});

// 3. Ganti background gambar produk/baju di Galeri
document.querySelectorAll("[style*='asset/']").forEach((el) => {
  const styleAttr = el.getAttribute("style");
  const updatedStyle = styleAttr.replace(/url\(['"]?asset\/([^'"]+)['"]?\)/g, (match, fileName) => {
    return `url('${SUPABASE_BASE_URL}/${encodeURIComponent(fileName)}')`;
  });
  el.setAttribute("style", updatedStyle);
});

// 4. Ganti sumber video & poster video
document.querySelectorAll("video").forEach((vid) => {
  if (vid.hasAttribute("poster") && vid.getAttribute("poster").includes("asset/")) {
    vid.poster = resolveSupabaseUrl(vid.getAttribute("poster"));
  }
  const source = vid.querySelector("source");
  if (source && source.getAttribute("src").includes("asset/")) {
    source.src = resolveSupabaseUrl(source.getAttribute("src"));
    vid.load();
  }
});

// 5. Injeksi style untuk background body & efek glitch logo
const dynamicStyle = document.createElement("style");
dynamicStyle.innerHTML = `
  body::before {
    background-image: url("${SUPABASE_BASE_URL}/download.jpg") !important;
  }
  .hero-logo::before,
  .hero-logo::after {
    background-image: url("${SUPABASE_BASE_URL}/kkl.png") !important;
  }
`;
document.head.appendChild(dynamicStyle);


const intro = document.getElementById("intro");
const enterBtn = document.getElementById("enterBtn");
const menuBtn = document.getElementById("menuBtn");
const nav = document.querySelector(".nav");

if (document.body) document.body.classList.add("locked");

if (enterBtn && intro) {
  enterBtn.addEventListener("click", () => {
    intro.classList.add("glitching");
    setTimeout(() => {
      intro.classList.remove("glitching");
      intro.classList.add("fading");
      setTimeout(() => {
        intro.classList.add("hide");
        intro.classList.remove("fading");
        document.body.classList.remove("locked");
      }, 880);
    }, 400);
  });
}

if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => nav.classList.toggle("open"));
}

document.querySelectorAll('.nav a[href^="#"]').forEach((a) => {
  a.addEventListener("click", () => nav && nav.classList.remove("open"));
});

// Music Player
const playBtn = document.getElementById("playBtn");
const player = document.querySelector(".player");
const timer = document.getElementById("timer");

const audio = new Audio(resolveSupabaseUrl("asset/lagu.mp3"));
if (playBtn && player && timer) {

  playBtn.addEventListener("click", () => {

    if (audio.paused) {
      audio.play();

      playBtn.textContent = "Ⅱ";
      playBtn.classList.add("active");
      player.classList.add("playing");

    } else {
      audio.pause();

      playBtn.textContent = "▶";
      playBtn.classList.remove("active");
      player.classList.remove("playing");
    }

  });

  // Update timer
  audio.addEventListener("timeupdate", () => {

    const current = Math.floor(audio.currentTime);

    const minutes = String(Math.floor(current / 60)).padStart(2, "0");
    const seconds = String(current % 60).padStart(2, "0");

    timer.textContent = `${minutes}:${seconds}`;

  });

  // Ketika lagu selesai
  audio.addEventListener("ended", () => {

    playBtn.textContent = "▶";
    playBtn.classList.remove("active");
    player.classList.remove("playing");

    timer.textContent = "00:00";

  });

}

// Reveal sections gently as they enter the viewport.
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.12 },
);

document.querySelectorAll(".section").forEach((section) => {
  section.classList.add("reveal");
  observer.observe(section);
});

// One-word wall interaction.
const wallForm = document.getElementById("wallForm");
const wallInput = document.getElementById("wallInput");
const wallMessage = document.getElementById("wallMessage");

if (wallForm && wallInput && wallMessage) {
  wallForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const word = wallInput.value.trim().replace(/\s+/g, " ");
    if (!word) {
      wallMessage.textContent = "Type one word first.";
      return;
    }
    if (word.includes(" ")) {
      wallMessage.textContent = "ONE WORD ONLY.";
      return;
    }
    wallMessage.textContent = `"${word.toUpperCase()}" has been pinned to the wall.`;
    wallInput.value = "";
  });
}

const commentForm = document.getElementById("commentForm");
const commentName = document.getElementById("commentName");
const commentText = document.getElementById("commentText");
const commentList = document.getElementById("commentList");
const clearCommentsBtn = document.getElementById("clearCommentsBtn");
const commentStorageKey = "kknMetalComments";

function getStoredComments() {
  try {
    const saved = JSON.parse(localStorage.getItem(commentStorageKey) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function saveComments(comments) {
  localStorage.setItem(commentStorageKey, JSON.stringify(comments));
}

function renderComments() {
  if (!commentList) return;

  const comments = getStoredComments();
  commentList.innerHTML = "";

  if (!comments.length) {
    const empty = document.createElement("p");
    empty.className = "comment-empty";
    empty.textContent = "Belum ada komentar. Jadilah yang pertama!";
    commentList.appendChild(empty);
    return;
  }

  comments.forEach((comment, index) => {
    const item = document.createElement("article");
    item.className = "comment-item";
    item.innerHTML = `
      <div class="comment-item-top">
        <strong>${comment.name}</strong>
        <button type="button" class="delete-comment-btn" data-index="${index}" aria-label="Hapus komentar ${comment.name}">Hapus</button>
      </div>
      <p>“${comment.message}”</p>
    `;
    commentList.appendChild(item);
  });
}

if (commentForm && commentName && commentText && commentList) {
  renderComments();

  commentForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = commentName.value.trim();
    const message = commentText.value.trim();

    if (!name || !message) {
      alert("Nama dan pesan tidak boleh kosong.");
      return;
    }

    const comments = getStoredComments();
    comments.unshift({ name, message });
    saveComments(comments);
    renderComments();
    commentForm.reset();
  });
}

if (commentList) {
  commentList.addEventListener("click", (event) => {
    const button = event.target.closest(".delete-comment-btn");
    if (!button) return;

    const index = Number(button.dataset.index);
    if (Number.isNaN(index)) return;

    const comments = getStoredComments();
    comments.splice(index, 1);
    saveComments(comments);
    renderComments();
  });
}

if (clearCommentsBtn) {
  clearCommentsBtn.addEventListener("click", () => {
    localStorage.removeItem(commentStorageKey);
    renderComments();
  });
}

// Tiny parallax effect for the hero mark.
const mark = document.querySelector(".hero-mark");
window.addEventListener("scroll", () => {
  const y = window.scrollY;
  if (mark) mark.style.transform = `translateY(${y * 0.08}px) rotate(-6deg)`;
});

// Random digital-glitch bursts, intentionally irregular like a damaged video signal.
const hero = document.querySelector(".hero");
const heroGlitch = document.querySelector(".hero-glitch");
const heroTitle = document.querySelector(".hero-copy h1");
const heroLogo = document.querySelector(".hero-logo");

function triggerGlitch() {

  if (!hero || !heroTitle || !heroLogo) return;

  // glitch tulisan
  heroTitle.classList.add("glitching");

  // glitch logo
  heroLogo.classList.add("glitching");

  // matikan setelah beberapa saat
  setTimeout(() => {

    heroTitle.classList.remove("glitching");
    heroLogo.classList.remove("glitching");

  }, 350);

  // ulangi secara acak
  setTimeout(
    triggerGlitch,
    2600 + Math.random() * 5200
  );
}

setTimeout(triggerGlitch, 1700);

// Hover distortion on the large hero mark.
heroGlitch?.addEventListener("mouseenter", () => {
  heroGlitch.classList.add("glitching");
});
heroGlitch?.addEventListener("mouseleave", () => {
  heroGlitch.classList.remove("glitching");
});

// ===========================================
// LOCATION SPOTLIGHT MODAL & BOKEH INTERACTION
// ===========================================
const locationCards = document.querySelectorAll(".show-card");
const spotlightModal = document.getElementById("locationSpotlight");
const spotlightImg = document.getElementById("spotlightImg");
const spotlightNum = document.getElementById("spotlightNum");
const spotlightCat = document.getElementById("spotlightCat");
const spotlightTitle = document.getElementById("spotlightTitle");
const spotlightDesc = document.getElementById("spotlightDesc");
const spotlightIndicator = document.getElementById("spotlightIndicator");
const spotlightClose = document.getElementById("spotlightClose");
const spotlightDoneBtn = document.getElementById("spotlightDoneBtn");
const spotlightPrev = document.getElementById("spotlightPrev");
const spotlightNext = document.getElementById("spotlightNext");

let currentSpotlightIndex = 0;

function updateSpotlightContent(index) {
  if (!locationCards.length) return;
  
  // Wrap index around
  if (index < 0) index = locationCards.length - 1;
  if (index >= locationCards.length) index = 0;
  
  currentSpotlightIndex = index;
  const card = locationCards[currentSpotlightIndex];
  
  const num = card.getAttribute("data-num") || `0${index + 1}`;
  const title = card.getAttribute("data-title") || "";
  const cat = card.getAttribute("data-category") || "";
  const desc = card.getAttribute("data-desc") || "";
  const img = card.getAttribute("data-img") || "";
  
  if (spotlightNum) spotlightNum.textContent = num;
  if (spotlightTitle) spotlightTitle.textContent = title;
  if (spotlightCat) spotlightCat.textContent = cat;
  if (spotlightDesc) spotlightDesc.textContent = desc;
  if (spotlightImg) {
    spotlightImg.src = img;
    spotlightImg.alt = title;
  }
  if (spotlightIndicator) {
    const totalFormatted = String(locationCards.length).padStart(2, "0");
    spotlightIndicator.textContent = `${num} / ${totalFormatted}`;
  }
}

function openSpotlight(index) {
  if (!spotlightModal) return;
  updateSpotlightContent(index);
  spotlightModal.classList.add("active");
  spotlightModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeSpotlight() {
  if (!spotlightModal) return;
  spotlightModal.classList.remove("active");
  spotlightModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// Add click listeners to location cards
locationCards.forEach((card, index) => {
  card.addEventListener("click", () => {
    openSpotlight(index);
  });
});

// Close button & done button listeners
spotlightClose?.addEventListener("click", closeSpotlight);
spotlightDoneBtn?.addEventListener("click", closeSpotlight);

// Prev & Next navigation
spotlightPrev?.addEventListener("click", (e) => {
  e.stopPropagation();
  updateSpotlightContent(currentSpotlightIndex - 1);
});

spotlightNext?.addEventListener("click", (e) => {
  e.stopPropagation();
  updateSpotlightContent(currentSpotlightIndex + 1);
});

// Close on backdrop click (outside container)
spotlightModal?.addEventListener("click", (e) => {
  if (e.target.classList.contains("spotlight-modal") || e.target.classList.contains("spotlight-bokeh-backdrop")) {
    closeSpotlight();
  }
});

// Keyboard navigation (ESC, Left, Right)
window.addEventListener("keydown", (e) => {
  if (!spotlightModal || !spotlightModal.classList.contains("active")) return;
  
  if (e.key === "Escape") {
    closeSpotlight();
  } else if (e.key === "ArrowLeft") {
    updateSpotlightContent(currentSpotlightIndex - 1);
  } else if (e.key === "ArrowRight") {
    updateSpotlightContent(currentSpotlightIndex + 1);
  }
});

// ===========================================
// GALLERY SEPARATOR SCROLL PROGRESS ANIMATION
// ===========================================
const productsContainer = document.querySelector(".products");
const separatorFill = document.querySelector(".separator-line-fill");

if (productsContainer && separatorFill) {
  const handleGalleryScroll = () => {
    // Only animate on mobile screens (max-width: 560px)
    if (window.innerWidth > 560) {
      separatorFill.style.height = "0%";
      return;
    }
    
    const rect = productsContainer.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Calculate scroll progress from entry to exit
    // rect.top goes from viewportHeight (entry) to -rect.height (exit)
    const entry = viewportHeight;
    const exit = -rect.height;
    const totalRange = entry - exit;
    const currentProgressDistance = entry - rect.top;
    
    // Adjust timing offset to make it track the center better
    // Starts filling when the section is 30% into view and finishes when it scrolls past
    let progress = currentProgressDistance / (totalRange * 0.9);
    
    const percent = Math.max(0, Math.min(100, progress * 100));
    separatorFill.style.height = `${percent}%`;
  };

  window.addEventListener("scroll", handleGalleryScroll, { passive: true });
  window.addEventListener("resize", handleGalleryScroll, { passive: true });
  // Initial call
  handleGalleryScroll();
}

// ==========================================
// INTERAKSI TAP / KLIK KARTU MEMBER DI MOBILE
// ==========================================
const memberCards = document.querySelectorAll(".member-card");

memberCards.forEach((card) => {
  card.addEventListener("click", (e) => {
    // Jika kartu yang disentuh sudah aktif, tutup (toggle off)
    const isAlreadyActive = card.classList.contains("active");

    // Tutup kartu aktif lainnya
    memberCards.forEach((c) => c.classList.remove("active"));

    // Jika belum aktif, aktifkan kartu yang disentuh
    if (!isAlreadyActive) {
      card.classList.add("active");
    }
  });
});

// Tutup kartu jika menyentuh area kosong di luar kartu
document.addEventListener("click", (e) => {
  if (!e.target.closest(".member-card")) {
    memberCards.forEach((c) => c.classList.remove("active"));
  }
});
