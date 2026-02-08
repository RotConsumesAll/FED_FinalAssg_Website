import {
  renderSidebar,
  activateEventForSelectedCentreItem,
} from "./centres-display.js";
import { assignEventHandlers } from "./centres-assign-handlers.js";
import { checkUserAndGetUid } from "../services/user-authentication-service.js";

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const centreId = urlParams.get("centreId");

  try {
    const uid = await checkUserAndGetUid("operator");
    await renderSidebar(uid);
    await assignEventHandlers();
    sessionStorage.clear();

    // Render page based on centreId
    if (centreId) {
      activateEventForSelectedCentreItem(centreId);
    } else {
      document.querySelector("ul.sidebar__menu").firstElementChild.click();
    }
  } catch (error) {
    window.location.href = "../../index.html";
    return;
  }
});
