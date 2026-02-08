import { checkUserAndGetUid } from "../services/user-authentication-service.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const uid = await checkUserAndGetUid("neaOfficer");
    window.__AUTH_UID__ = uid;
  } catch (error) {
    window.location.href = "../../index.html";
  }
});
