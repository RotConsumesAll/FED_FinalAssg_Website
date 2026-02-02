import { handleForm, handleLoginAttempt } from "./login-handlers.js";

document.addEventListener("DOMContentLoaded", (e) => {
  const loginButton = document.getElementById("login-button");
  const form = document.getElementById("login-form");

  // Event listeners
  form.addEventListener("submit", handleForm);
  loginButton.addEventListener("click", handleLoginAttempt);
});
