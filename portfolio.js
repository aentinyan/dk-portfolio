import "./site.js";

const title = document.querySelector(".wordmark");
const artwork = title.querySelector(".wordmark-image");
const canvas = title.querySelector("canvas");
const context = canvas.getContext("2d");
const texture = document.createElement("canvas");
const textureContext = texture.getContext("2d");

if (context && textureContext) {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = window.matchMedia("(any-pointer: fine)");
  let cursor;
  let frame = 0;
  let textureReady = false;

  function drawTexture() {
    texture.width = 800;
    texture.height = 400;
    const pixels = textureContext.createImageData(texture.width, texture.height);
    const stops = [
      [0.00, [15, 25, 54]],
      [0.12, [29, 53, 123]],
      [0.27, [59, 109, 210]],
      [0.40, [153, 191, 231]],
      [0.49, [239, 247, 254]],
      [0.56, [190, 208, 230]],
      [0.68, [89, 116, 175]],
      [0.78, [38, 56, 103]],
      [0.88, [79, 114, 177]],
      [1.00, [15, 25, 54]],
    ];

    for (let y = 0; y < texture.height; y += 1) {
      const v = y / texture.height;
      for (let x = 0; x < texture.width; x += 1) {
        const u = x / texture.width;
        // Bend the repeating reflections into diagonal folds.
        const bend = 1.18 * u * u - 0.28 * u;
        const ripple = 0.125 * Math.sin(5.2 * u + 2.6 * v) + 0.029 * Math.sin(8.3 * u - 4.5 * v);
        const phase = (v - bend + ripple) * 2.25 + 0.73;
        const band = phase - Math.floor(phase);
        const next = stops.findIndex(([offset]) => offset > band);
        const [start, shadow] = stops[next - 1];
        const [end, highlight] = stops[next];
        const blend = (band - start) / (end - start);
        const eased = blend * blend * (3 - 2 * blend);
        const grain = Math.random() * 5 - 2.5;
        const index = (y * texture.width + x) * 4;

        for (let channel = 0; channel < 3; channel += 1) {
          pixels.data[index + channel] = shadow[channel] + (highlight[channel] - shadow[channel]) * eased + grain;
        }
        pixels.data[index + 3] = 255;
      }
    }

    textureContext.putImageData(pixels, 0, 0);
    textureReady = true;
  }

  function paint() {
    frame = 0;
    if (!cursor || !artwork.naturalWidth) return;
    const { left, top, width, height } = title.getBoundingClientRect();
    if (!width || !height) return;
    const x = cursor.x - left;
    const y = cursor.y - top;
    if (x < 0 || x > width || y < 0 || y > height) {
      hide();
      return;
    }

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(width * ratio);
    const pixelHeight = Math.round(height * ratio);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    if (!textureReady) drawTexture();

    context.setTransform(pixelWidth / width, 0, 0, pixelHeight / height, 0, 0);
    context.clearRect(0, 0, width, height);

    const driftX = 0.11 * (x - width / 2);
    const driftY = 0.10 * (y - height / 2);
    context.drawImage(texture, -0.08 * width + driftX, -0.10 * height + driftY, 1.16 * width, 1.20 * height);

    context.globalCompositeOperation = "destination-in";
    context.drawImage(artwork, 0, 0, width, height);

    const radius = width * 0.56;
    const verticalScale = 0.72;
    context.save();
    context.scale(1, verticalScale);
    const reveal = context.createRadialGradient(x, y / verticalScale, 0, x, y / verticalScale, radius);
    reveal.addColorStop(0, "#fff");
    reveal.addColorStop(0.24, "#fff");
    reveal.addColorStop(0.55, "rgba(255, 255, 255, .81)");
    reveal.addColorStop(0.82, "rgba(255, 255, 255, .23)");
    reveal.addColorStop(1, "transparent");
    context.fillStyle = reveal;
    context.fillRect(0, 0, width, height / verticalScale);
    context.restore();
    context.globalCompositeOperation = "source-over";
    title.classList.add("is-revealed");
  }

  function queuePaint() {
    if (cursor && !frame) frame = requestAnimationFrame(paint);
  }

  function pointAt(event) {
    if (!pointer.matches || motion.matches || event.pointerType !== "mouse") return;
    cursor = { x: event.clientX, y: event.clientY };
    queuePaint();
  }

  function hide() {
    cursor = undefined;
    cancelAnimationFrame(frame);
    frame = 0;
    title.classList.remove("is-revealed");
  }

  title.addEventListener("pointerenter", pointAt);
  title.addEventListener("pointermove", pointAt);
  title.addEventListener("pointerleave", hide);
  title.addEventListener("pointercancel", hide);
  motion.addEventListener("change", hide);
  pointer.addEventListener("change", hide);
  new ResizeObserver(queuePaint).observe(title);
  artwork.addEventListener("load", queuePaint, { once: true });
}
