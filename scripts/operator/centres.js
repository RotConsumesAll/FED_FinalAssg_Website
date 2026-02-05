import { renderSidebar } from "./centres-display.js";
import { assignEventHandlers } from "./centres-assign-handlers.js";

document.addEventListener("DOMContentLoaded", async () => {
  // TODO get UID
  await renderSidebar("OPERATOR_001");
  await assignEventHandlers();
  sessionStorage.clear();

  document.querySelector("ul.sidebar__menu").firstElementChild.click();
});
