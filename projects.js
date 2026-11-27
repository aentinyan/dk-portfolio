import { config } from "./config.js";
import { prepareDialog } from "./site.js";

const preview = document.querySelector("#project-preview");
const previewTitle = preview.querySelector("#project-preview-title");
const previewDetails = preview.querySelector(".project-preview-details");
const showPreview = typeof preview.showModal === "function" ? prepareDialog(preview) : null;

document.querySelectorAll("[data-project]").forEach((link) => {
  const url = config.projectUrls[link.dataset.project];
  if (url) {
    link.href = url;
    return;
  }

  if (!showPreview) return;
  link.setAttribute("aria-haspopup", "dialog");
  link.addEventListener("click", (event) => {
    event.preventDefault();
    previewTitle.textContent = link.querySelector(".project-name").textContent;
    const year = link.querySelector(".project-year").textContent;
    const field = link.querySelector(".project-field").textContent;
    previewDetails.textContent = year + " · " + field;
    showPreview(link);
  });
});
