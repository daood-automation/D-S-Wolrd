(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  /* ---------- tiny warm click sound (no asset files needed) ---------- */
  let audioCtx = null;
  function tap() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, t);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.09);
    } catch (e) { /* audio not available, fine */ }
  }
  function unlockChime() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(500, t + 0.3);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.5);
    } catch (e) {}
  }

  /* ---------- background stars ---------- */
  const starField = $("stars");
  for (let i = 0; i < 40; i++) {
    const s = document.createElement("span");
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 55 + "%";
    s.style.animationDelay = (Math.random() * 4).toFixed(2) + "s";
    starField.appendChild(s);
  }

  /* ---------- arrival text sequence ---------- */
  const SUBLINES = [
    "welcome home, Daood",
    "it's good to see you again"
  ];
  const THRESHOLD_PHRASES = [
    "she smiled when she saw you",
    "another memory begins",
    "our world missed you",
    "you're home, stay a while",
    "she's been thinking of you"
  ];

  const lineTitle = document.querySelector(".line-title");
  const lineSub = document.querySelector(".line-sub");
  const lineSub2 = document.querySelector(".line-sub2");
  lineSub.setAttribute("data-text", SUBLINES[0]);
  lineSub2.setAttribute("data-text", SUBLINES[1]);

  const pinArea = $("pinArea");

  function revealArrivalText() {
    setTimeout(() => lineTitle.classList.add("show"), 300);
    setTimeout(() => lineSub.classList.add("show"), 1500);
    setTimeout(() => lineSub2.classList.add("show"), 2700);
    setTimeout(() => pinArea.classList.add("show"), 3900);
  }
  revealArrivalText();

  /* ---------- PIN logic ---------- */
  const STORAGE_PIN = "dsworld_pin";
  const dotsEl = $("pinDots");
  const dots = Array.from(dotsEl.children);
  const pinHint = $("pinHint");
  const keypad = $("keypad");

  let mode = localStorage.getItem(STORAGE_PIN) ? "enter" : "create";
  let firstPin = "";
  let entered = "";

  function setHint() {
    if (mode === "create") pinHint.textContent = "set a pin for our world";
    else if (mode === "confirm") pinHint.textContent = "enter it once more";
    else pinHint.textContent = "";
  }
  setHint();

  function renderDots() {
    dots.forEach((d, i) => {
      d.classList.toggle("filled", i < entered.length);
    });
  }

  function shakeDots() {
    dots.forEach((d) => d.classList.add("error"));
    setTimeout(() => dots.forEach((d) => d.classList.remove("error")), 400);
  }

  function showThreshold(cb) {
    const el = $("thresholdPhrase");
    el.textContent = THRESHOLD_PHRASES[Math.floor(Math.random() * THRESHOLD_PHRASES.length)];
    el.classList.add("show");
    setTimeout(() => {
      el.classList.remove("show");
      cb();
    }, 2000);
  }

  function goHome() {
    document.getElementById("arrival").classList.remove("active");
    document.getElementById("home").classList.add("active");
    initHome();
  }

  function handleComplete() {
    if (mode === "create") {
      firstPin = entered;
      entered = "";
      mode = "confirm";
      setHint();
      renderDots();
      return;
    }
    if (mode === "confirm") {
      if (entered === firstPin) {
        localStorage.setItem(STORAGE_PIN, entered);
        mode = "enter";
        unlockChime();
        setTimeout(() => showThreshold(goHome), 700);
      } else {
        shakeDots();
        entered = "";
        mode = "create";
        firstPin = "";
        setHint();
        renderDots();
      }
      return;
    }
    // mode === enter
    const saved = localStorage.getItem(STORAGE_PIN);
    if (entered === saved) {
      unlockChime();
      setTimeout(() => showThreshold(goHome), 700);
    } else {
      shakeDots();
      entered = "";
      renderDots();
    }
  }

  keypad.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const key = btn.getAttribute("data-key");
    if (key === "clear") { entered = ""; tap(); renderDots(); return; }
    if (key === "back") { entered = entered.slice(0, -1); tap(); renderDots(); return; }
    if (entered.length >= 4) return;
    tap();
    entered += key;
    renderDots();
    if (entered.length === 4) setTimeout(handleComplete, 150);
  });

  /* ---------- home screen ---------- */
  let homeInitialized = false;
  function initHome() {
    if (homeInitialized) return;
    homeInitialized = true;

    loadPhoto("dsworld_avatar_daood", $("daoodAvatar"));
    loadPhoto("dsworld_avatar_saima", $("saimaAvatar"));
    loadPhoto("dsworld_home_bg", null, $("homeBg"));

    wirePhotoInput("daoodCard", "daoodPhotoInput", "dsworld_avatar_daood", $("daoodAvatar"), null);
    wirePhotoInput("saimaCard", "saimaPhotoInput", "dsworld_avatar_saima", $("saimaAvatar"), null);
    wireBgInput();

    tickClocks();
    setInterval(tickClocks, 30000);

    ["tileWorld", "tileWhisper", "tileMemory", "tileStory"].forEach((id) => {
      $(id).addEventListener("click", () => toast("this room opens in the next phase"));
    });

    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        if (btn.dataset.tile !== "home") toast("coming soon");
      });
    });

    $("settingsBtn").addEventListener("click", () => toast("settings arrive in the next phase"));
  }

  function wirePhotoInput(cardId, inputId, storageKey, imgEl) {
    const card = $(cardId);
    const input = $(inputId);
    card.addEventListener("click", () => input.click());
    input.addEventListener("change", () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        localStorage.setItem(storageKey, reader.result);
        imgEl.src = reader.result;
        toast("looking lovely");
      };
      reader.readAsDataURL(file);
    });
  }

  function wireBgInput() {
    const btn = $("bgChangeBtn");
    const input = $("bgPhotoInput");
    btn.addEventListener("click", () => input.click());
    input.addEventListener("change", () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        localStorage.setItem("dsworld_home_bg", reader.result);
        $("homeBg").style.backgroundImage = "url(" + reader.result + ")";
        toast("our home feels warmer already");
      };
      reader.readAsDataURL(file);
    });
  }

  function loadPhoto(storageKey, imgEl, bgEl) {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;
    if (imgEl) imgEl.src = saved;
    if (bgEl) bgEl.style.backgroundImage = "url(" + saved + ")";
  }

  function tickClocks() {
    const opts = { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Karachi" };
    const now = new Date().toLocaleTimeString("en-US", opts);
    $("daoodTime").textContent = now;
    $("saimaTime").textContent = now;
  }

  let toastTimer = null;
  function toast(msg) {
    const el = $("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  /* ---------- PWA service worker ---------- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
})();
