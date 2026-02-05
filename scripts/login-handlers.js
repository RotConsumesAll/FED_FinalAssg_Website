// Handlers
import { authenticateSignin, createUser } from "./services/login-service.js";

export function handleForm(e) {
  e.preventDefault();
}

export function handleLoginAttempt(e) {
  const emailInput = document.getElementById("login-email-input");
  const passwordInput = document.getElementById("login-password-input");

  let email, password;
  if (emailInput.value.length > 0) {
    email = emailInput.value;
  }
  if (passwordInput.value.length > 0) {
    password = passwordInput.value;
  }

  authenticateSignin(email, password);
}

export function handleSignUpAttempt(e) {
  const emailInput = document.getElementById("sign-up-email-input");
  const passwordInput = document.getElementById("sign-up-password-input");
  const nameInput = document.getElementById("sign-up-name-input");

  let email, password, name;
  if (emailInput.value.length > 0) {
    email = emailInput.value;
  }
  if (passwordInput.value.length > 0) {
    password = passwordInput.value;
  }
  if (nameInput.value.length > 0) {
    name = nameInput.value;
  }

  createUser(email, name, password);
}
