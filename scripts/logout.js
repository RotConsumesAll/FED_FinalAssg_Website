import { auth, signOut } from "./firebase/index.js";

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