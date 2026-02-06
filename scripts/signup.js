import { handleForm, handleSignUpAttempt } from "./user-handlers.js";

document.addEventListener("DOMContentLoaded", (e) => {
  const signUpButton = document.getElementById("sign-up-button");
  const forms = document.getElementsByTagName("form");

  for (const form of forms) {
    form.addEventListener("submit", handleForm);
  }

  signUpButton.addEventListener("click", handleSignUpAttempt);
});
