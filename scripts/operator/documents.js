import { renderRentalAgreements } from "./documents-display.js";
import { checkUserAndGetUid } from "../services/user-authentication-service.js";
import {
  assignDeleteConfirmationHandler,
  assignDeleteHandler,
  assignEditHandler,
} from "./documents-display.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const uid = await checkUserAndGetUid("operator");
    sessionStorage.clear();
    await renderRentalAgreements();

    assignDeleteHandler();
    assignEditHandler();
    assignDeleteConfirmationHandler();
  } catch (error) {
    window.location.href = "../../index.html";
    return;
  }
});
