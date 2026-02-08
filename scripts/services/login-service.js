import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "../firebase/index.js";
import { getUserRole } from "../database/meaningful-helpers.js";

async function redirectToPageWithRole(role) {
  switch (role) {
    case "customer":
      window.location.href = "./pages/customer/customer_home.html";
      break;
    case "stallOwner":
      window.location.href = "./pages/stallowner/stallowner_menu.html";
      break;
    case "neaOfficer":
      window.location.href = "./pages/officer/officer_home.html";
      break;
    case "operator":
      window.location.href = "./pages/operator/centres.html";
      break;
    default:
      alert("Unknown user role. Cannot redirect.");
      break;
  }
}

export async function authenticateSignin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    const uid = user.uid;
    const role = await getUserRole(uid);

    if (!role) {
      alert("User role not found. Please contact support.");
      return;
    }

    await redirectToPageWithRole(role);
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
  }
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
