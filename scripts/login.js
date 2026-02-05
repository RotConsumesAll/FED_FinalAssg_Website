import {
  handleForm,
  handleLoginAttempt,
  handleSignUpAttempt,
} from "./login-handlers.js";

document.addEventListener("DOMContentLoaded", (e) => {
  const loginButton = document.getElementById("login-button");
  const signupButton = document.getElementById("sign-up-button");
  const forms = document.getElementsByTagName("form");

  // Event listeners
  for (const form of forms) {
    form.addEventListener("submit", handleForm);
  }

  loginButton.addEventListener("click", handleLoginAttempt);
  signupButton.addEventListener("click", handleSignUpAttempt);
});
