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

// --- fake hit counter (increments per visit, stored locally in your browser) ---
function initCounter(){
  const el = document.getElementById("hitcounter");
  if(!el) return;
  let count = parseInt(localStorage.getItem("crocodose_hits") || "133700", 10);
  count += 1;
  localStorage.setItem("crocodose_hits", count);
  el.textContent = String(count).padStart(7,"0");
}

// --- guestbook (client-side only, resets on reload, just for fun) ---
function initGuestbook(){
  const form = document.getElementById("gb-form");
  if(!form) return;
  const list = document.getElementById("gb-list");
  form.addEventListener("submit", function(e){
    e.preventDefault();
    const name = document.getElementById("gb-name").value || "Anonymous Crocodile";
    const msg = document.getElementById("gb-message").value || "...";
    const entry = document.createElement("div");
    entry.className = "gb-entry";
    entry.innerHTML = "<b>" + escapeHtml(name) + "</b>: " + escapeHtml(msg);
    list.prepend(entry);
    form.reset();
  });
}
function escapeHtml(str){
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

window.addEventListener("DOMContentLoaded", function(){
  initCounter();
  initGuestbook();
});
