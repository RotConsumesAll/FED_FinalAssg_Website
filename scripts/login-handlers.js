// Handlers
import { authenticateSignin } from "./services/login-service.js";

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
