import { config } from "./config.js";

export function prepareDialog(dialog) {
  let trigger;

  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) {
      dialog.close();
    }
  });

  dialog.addEventListener("close", () => trigger?.focus({ preventScroll: true }));

  return (source) => {
    trigger = source;
    dialog.showModal();
  };
}

document.querySelectorAll("[data-social]").forEach((link) => {
  const url = config.socialUrls[link.dataset.social];
  if (url) link.href = url;
});

const contactDialog = document.querySelector("#contact-dialog");
const contactTrigger = document.querySelector("[data-contact-open]");
const contactForm = contactDialog?.querySelector(".contact-form");

if (typeof contactDialog?.showModal === "function" && contactTrigger && contactForm) {
  const openContact = prepareDialog(contactDialog);
  contactTrigger.setAttribute("aria-haspopup", "dialog");
  contactTrigger.addEventListener("click", (event) => {
    event.preventDefault();
    openContact(contactTrigger);
  });

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const fields = new FormData(contactForm);
    const body = [
      "Имя: " + (fields.get("name").trim() || "—"),
      "Контакт: " + fields.get("contact").trim(),
      fields.get("message").trim(),
    ].filter(Boolean).join("\n\n");

    const email = new URL(contactTrigger.href);
    email.searchParams.set("subject", "Сообщение с сайта-портфолио");
    email.searchParams.set("body", body);
    window.location.href = email.href.replaceAll("+", "%20");
  });
}
