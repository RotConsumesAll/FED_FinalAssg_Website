import { renderSidebar, assignCentreSelectHandlers } from "./centres-handlers.js";

document.addEventListener("DOMContentLoaded", async () => {
  // TODO get UID
  await renderSidebar("OPERATOR_UID_1");
  await assignCentreSelectHandlers();

  document.querySelector("ul.sidebar__menu").firstElementChild.click();
});
