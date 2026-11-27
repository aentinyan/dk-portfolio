import "./case.js";

const video = document.querySelector(".hemilink-video");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const observer = new IntersectionObserver(([entry]) => {
  if (entry.intersectionRatio < 0.35) return;
  observer.disconnect();
  if (!reducedMotion.matches) {
    video.play().catch(() => {
      // The native controls remain available if autoplay is blocked.
    });
  }
}, { threshold: 0.35 });

observer.observe(video);
