import { renderRentalAgreements } from "./documents-display.js";
import { checkUserAndGetUid } from "../services/user-authentication-service.js";
import {
  assignCreateStallHandler,
  populateHawkerCentreDropdown,
} from "./documents-display.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const uid = await checkUserAndGetUid("operator");
    sessionStorage.clear();
    await renderRentalAgreements();
    await populateHawkerCentreDropdown(uid);
    assignCreateStallHandler();
  } catch (error) {
    window.location.href = "../../index.html";
    return;
  }
});
