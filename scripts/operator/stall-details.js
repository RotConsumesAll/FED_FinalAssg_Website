import {
  renderSidebar,
  assignStallSelectHandlers,
  activateEventForSelectedStallItem,
} from "./stall-details-display.js";
import { checkUserAndGetUid } from "../services/user-authentication-service.js";

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const centreId = urlParams.get("centreId");
  const stallId = urlParams.get("stallId");

  try {
    const uid = await checkUserAndGetUid("operator");

    await renderSidebar(centreId);
    assignStallSelectHandlers(centreId);
    activateEventForSelectedStallItem(stallId);
  } catch (error) {
    window.location.href = "../../index.html";
    return;
  }
});
