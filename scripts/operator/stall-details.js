import { renderSidebar, assignStallSelectHandlers, activateEventForSelectedStallItem } from "./stall-details-display.js";

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const centreName = urlParams.get("centreName");
  const stallName = urlParams.get("stallName");

  await renderSidebar(centreName);
  assignStallSelectHandlers(centreName);
  activateEventForSelectedStallItem(stallName);
});
