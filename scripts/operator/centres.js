import { renderSidebar } from "./centres-handlers.js";
import { assignEventHandlers } from "./centre-assign-handlers.js";

document.addEventListener("DOMContentLoaded", async () => {
  // TODO get UID
  await renderSidebar("OPERATOR_UID_1");
  await assignEventHandlers();

  document.querySelector("ul.sidebar__menu").firstElementChild.click();
});
