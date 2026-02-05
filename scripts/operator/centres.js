import {
  renderSidebar,
  activateEventForSelectedCentreItem,
} from "./centres-display.js";
import { assignEventHandlers } from "./centres-assign-handlers.js";

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const centreId = urlParams.get("centreId");

  // TODO get UID
  await renderSidebar("OPERATOR_001");
  await assignEventHandlers();
  sessionStorage.clear();

  if (centreId) {
    activateEventForSelectedCentreItem(centreId);
  } else {
    document.querySelector("ul.sidebar__menu").firstElementChild.click();
  }
});
