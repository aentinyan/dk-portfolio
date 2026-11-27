import "./case.js";

const scene = document.querySelector(".curio-display");
const room = scene.querySelector(".curio-room");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let roomFrame = 0;

function updateRoomOffset() {
  roomFrame = 0;
  if (reducedMotion.matches) {
    room.style.removeProperty("--curio-room-offset");
    return;
  }

  const { top, height } = scene.getBoundingClientRect();
  const viewportHeight = document.documentElement.clientHeight;
  const progress = (viewportHeight - top) / (viewportHeight + height);
  const offset = (Math.max(0, Math.min(1, progress)) - 0.5) * height * 0.32;
  room.style.setProperty("--curio-room-offset", `${offset}px`);
}

function scheduleRoomUpdate() {
  if (!roomFrame) roomFrame = requestAnimationFrame(updateRoomOffset);
}

window.addEventListener("scroll", scheduleRoomUpdate, { passive: true });
window.addEventListener("resize", scheduleRoomUpdate);
reducedMotion.addEventListener("change", scheduleRoomUpdate);
scheduleRoomUpdate();

const player = document.querySelector(".curio-video");
const source = player.querySelector("source");

// Some browsers need byte ranges to play a remote MP4 but can play a local Blob.
player.addEventListener("error", async () => {
  const resume = !player.paused;
  try {
    const response = await fetch(source.src);
    if (!response.ok) return;
    player.src = URL.createObjectURL(await response.blob());
    if (resume) await player.play();
  } catch {
    // Let the native player handle any remaining network or playback error.
  }
}, { capture: true, once: true });
