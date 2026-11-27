import { config } from "./config.js";
import "./site.js";

document.querySelectorAll("[data-case-neighbor]").forEach((link) => {
  const url = config.projectUrls[link.dataset.caseNeighbor];
  if (url) link.href = url;
});
