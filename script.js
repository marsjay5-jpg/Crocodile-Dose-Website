// CROCODILE DOSE — retro effects script

// --- sparkle cursor trail ---
const sparkleChars = ["✨","⭐","💚","🐊","💫"];
let lastSparkle = 0;
document.addEventListener("mousemove", function(e){
  const now = Date.now();
  if(now - lastSparkle < 60) return; // throttle
  lastSparkle = now;
  const el = document.createElement("span");
  el.className = "sparkle";
  el.textContent = sparkleChars[Math.floor(Math.random()*sparkleChars.length)];
  el.style.left = (e.clientX - 8) + "px";
  el.style.top = (e.clientY - 8) + "px";
  el.style.animationDuration = "800ms";
  document.body.appendChild(el);
  setTimeout(()=> el.remove(), 850);
});

// --- real hit counter (shared across all visitors via Cloudflare KV) ---
function initCounter(){
  const el = document.getElementById("hitcounter");
  if(!el) return;
  fetch("/api/counter")
    .then(res => res.json())
    .then(data => {
      el.textContent = String(data.count).padStart(7,"0");
    })
    .catch(() => {
      el.textContent = "??????";
    });
}

// --- real guestbook (shared across all visitors via Cloudflare KV) ---
function initGuestbook(){
  const form = document.getElementById("gb-form");
  const list = document.getElementById("gb-list");
  if(!list) return;

  function renderEntries(entries){
    // clear everything except the static "Webmaster" welcome entry
    list.querySelectorAll(".gb-entry.dynamic").forEach(el => el.remove());
    entries.forEach(entry => {
      const div = document.createElement("div");
      div.className = "gb-entry dynamic";
      div.innerHTML = "<b>" + entry.name + "</b>: " + entry.message;
      list.appendChild(div);
    });
  }

  function loadEntries(){
    fetch("/api/guestbook")
      .then(res => res.json())
      .then(data => renderEntries(data.entries || []))
      .catch(() => {});
  }

  loadEntries();

  if(!form) return;
  form.addEventListener("submit", function(e){
    e.preventDefault();
    const name = document.getElementById("gb-name").value || "Anonymous Crocodile";
    const message = document.getElementById("gb-message").value || "...";

    fetch("/api/guestbook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, message }),
    })
      .then(res => res.json())
      .then(data => {
        if(data.entries) renderEntries(data.entries);
        form.reset();
      })
      .catch(() => {
        alert("Couldn't save your message right now — try again in a moment.");
      });
  });
}

// --- merch vertical auto-scroller with 3D middle-scale + edge-overlap effect ---
function initMerchScroll(){
  const box = document.getElementById("merchScroll");
  const track = document.getElementById("merchTrack");
  if(!box || !track) return;

  const speed = 0.6; // px per frame
  let posY = 0;

  function frame(){
    posY -= speed;
    const half = track.scrollHeight / 2;
    if(Math.abs(posY) >= half){
      posY += half;
    }
    track.style.transform = "translateY(" + posY + "px)";

    const boxRect = box.getBoundingClientRect();
    const centerY = boxRect.top + boxRect.height / 2;
    const imgs = track.querySelectorAll("img");
    imgs.forEach(img => {
      const r = img.getBoundingClientRect();
      const imgCenter = r.top + r.height / 2;
      const dist = Math.abs(imgCenter - centerY);
      const maxDist = boxRect.height / 2;
      const norm = Math.min(dist / maxDist, 1);
      const scale = 1.5 - norm * 0.55; // pops past box edge near center, shrinks toward top/bottom
      img.style.transform = "scale(" + scale.toFixed(3) + ")";
      img.style.zIndex = Math.round((1 - norm) * 100);
    });

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// --- stills page lightbox ---
function initLightbox(){
  const overlay = document.getElementById("lightbox");
  const overlayImg = document.getElementById("lightboxImg");
  const closeBtn = document.getElementById("lightboxClose");
  const thumbs = document.querySelectorAll(".still-thumb img");
  if(!overlay || thumbs.length === 0) return;

  function openLightbox(src, alt){
    overlayImg.src = src;
    overlayImg.alt = alt;
    overlay.classList.add("active");
  }
  function closeLightbox(){
    overlay.classList.remove("active");
    overlayImg.src = "";
  }

  thumbs.forEach(img => {
    img.addEventListener("click", () => openLightbox(img.src, img.alt));
  });
  closeBtn.addEventListener("click", closeLightbox);
  overlay.addEventListener("click", function(e){
    if(e.target === overlay) closeLightbox();
  });
  document.addEventListener("keydown", function(e){
    if(e.key === "Escape") closeLightbox();
  });
}

window.addEventListener("DOMContentLoaded", function(){
  initCounter();
  initGuestbook();
  initMerchScroll();
  initLightbox();
});

