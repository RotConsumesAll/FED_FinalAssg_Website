import { renderSidebar } from "./centres-display.js";
import { assignEventHandlers } from "./centres-assign-handlers.js";

document.addEventListener("DOMContentLoaded", async () => {
  // TODO get UID
  await renderSidebar("OPERATOR_UID_1");
  await assignEventHandlers();

  document.querySelector("ul.sidebar__menu").firstElementChild.click();
});
