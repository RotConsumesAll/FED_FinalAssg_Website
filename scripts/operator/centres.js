import {
  renderSidebar,
  activateEventForSelectedCentreItem,
} from "./centres-display.js";
import { assignEventHandlers } from "./centres-assign-handlers.js";
import { auth, onAuthStateChanged } from "../firebase/authentication.js";

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const centreId = urlParams.get("centreId");

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const uid = user.uid;
      await renderSidebar(uid);
      await assignEventHandlers();
      sessionStorage.clear();

      if (centreId) {
        activateEventForSelectedCentreItem(centreId);
      } else {
        document.querySelector("ul.sidebar__menu").firstElementChild.click();
      }
    } else {
      alert("You are signed out. Redirecting to HawkPortal login page.");
      window.location.href = "./signin.html";
    }
  });
});
