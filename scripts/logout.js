import { auth } from "./firebase/index.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function() {
  const logoutButton = document.querySelector('.log-out-button');
  
  if (logoutButton) {
    logoutButton.addEventListener('click', async function() {
      try {
        await signOut(auth);
        
        window.location.href = "../index.html";
        
      } catch (error) {
        console.error("Error signing out:", error);
        alert("Failed to log out. Please try again.");
      }
    });
  }
});