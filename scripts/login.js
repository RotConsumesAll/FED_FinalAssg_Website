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

  if (loginButton) {
    loginButton.addEventListener("click", handleLoginAttempt);
  }

  if (signupButton) {
    signupButton.addEventListener("click", handleSignUpAttempt);
  }

  loginButton.addEventListener("click", handleLoginAttempt);
  signupButton.addEventListener("click", handleSignUpAttempt);
});
