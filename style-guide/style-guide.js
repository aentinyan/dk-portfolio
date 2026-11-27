import { prepareDialog } from "../site.js";

const colors = document.querySelectorAll("[data-color]");
const copyStatus = document.querySelector("[data-copy-status]");

colors.forEach((button) => {
  button.addEventListener("click", async () => {
    const color = button.dataset.color;
    try {
      await navigator.clipboard.writeText(color);
      copyStatus.textContent = `${color} скопирован.`;
    } catch {
      const range = document.createRange();
      range.selectNodeContents(button.querySelector("code"));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      copyStatus.textContent = `${color} выделен для копирования.`;
    }
  });
});

const frames = [...document.querySelectorAll(".kit-viewport iframe")];
const sizes = new ResizeObserver((entries) => {
  entries.forEach(({ target, contentRect }) => {
    const frame = target.querySelector("iframe");
    target.style.setProperty("--frame-scale", contentRect.width / Number(frame.width));
  });
});
frames.forEach((frame) => sizes.observe(frame.parentElement));

const choices = document.querySelectorAll("[data-preview]");
const openPreview = document.querySelector("[data-open-preview]");

choices.forEach((choice) => {
  choice.addEventListener("click", () => {
    if (choice.getAttribute("aria-pressed") === "true") return;
    const path = choice.dataset.preview;
    const label = choice.textContent;
    choices.forEach((button) => button.setAttribute("aria-pressed", String(button === choice)));
    frames.forEach((frame) => {
      const device = frame.width === "1440" ? "на десктопе" : "на телефоне";
      frame.title = `${label} портфолио ${device}`;
      frame.src = path;
    });
    openPreview.href = path;
  });
});

const dialog = document.querySelector("#kit-contact-example");
const trigger = document.querySelector("[data-kit-open-form]");
const form = document.querySelector("[data-kit-form]");
const formStatus = document.querySelector("[data-kit-form-status]");
const defaultMessage = formStatus.textContent;

const openDialog = prepareDialog(dialog);
trigger.addEventListener("click", () => openDialog(trigger));
form.addEventListener("input", () => {
  if (formStatus.textContent !== defaultMessage) formStatus.textContent = defaultMessage;
});
form.addEventListener("submit", (event) => {
  event.preventDefault();
  formStatus.textContent = "Обязательное поле заполнено.";
});
