import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "../firebase/index.js";

import { getUserRole } from "../database/meaningful-helpers.js";

export async function authenticateSignin(email, password) {
    try {
    // Signing in de user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log(user);

    // Get role from the database
    const uid = user.uid;
    const role = await getUserRole(uid);

    if (!role) {
      alert("User role not found. Please contact support.");
      return;
    }

    console.log("User role:", role);

    // Redirect based on role yay
    switch (role) {
      case "customer":
        window.location.href = "./customer_home.html";
        break;
      case "stallOwner":
        window.location.href = "./stallowner_menu.html";
        break;
      case "neaOfficer":
        window.location.href = "./officer_home.html";
        break;
      case "operator":
        window.location.href = "./operator_dashboard.html";
        break;
      default:
        alert("Unknown role. Cannot redirect.");
        break;
    }

  } catch (error) {
      if (error.code === "auth/user-not-found") {
        alert("No account found with this email.");
      } else if (error.code === "auth/wrong-password") {
        alert("Incorrect password. Please try again.");
      } else if (error.code === "auth/invalid-email") {
        alert("Please enter a valid email address.");
      } else if (error.code === "auth/missing-password") {
        alert("Please enter your password.");
      } else {
        alert(error.message);
      }
    };
}

export function createUser(email, name, password) {
  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      // Signed up
      const user = userCredential.user;
      await redirectToPageWithUID(user.uid);

      // to store user info in firebase
      return updateProfile(user, {
        displayName: name,
      });
    })
    .catch((error) => {
      if (error.code === "auth/email-already-in-use") {
        alert("This email is already registered. Try signing in instead.");
      } else if (error.code === "auth/weak-password") {
        alert("Password must be at least 6 characters.");
      } else if (error.code === "auth/invalid-email") {
        alert("Please enter a valid email address.");
      } else {
        alert(error.message);
      }
    });
}
