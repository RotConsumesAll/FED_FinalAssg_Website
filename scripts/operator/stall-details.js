import {
  renderSidebar,
  assignStallSelectHandlers,
  activateEventForSelectedStallItem,
} from "./stall-details-display.js";

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const centreId = urlParams.get("centreId");
  const stallId = urlParams.get("stallId");

  await renderSidebar(centreId);
  assignStallSelectHandlers(centreId);
  activateEventForSelectedStallItem(stallId);
});
