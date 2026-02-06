import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "../firebase/index.js";

export function authenticateSignin(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      console.log(user);
      window.location.href = "customer_home.html";
    })
    .catch((error) => {
      if (error.code === "auth/user-not-found") {
        alert("No account found with this email.");
      } 
      else if (error.code === "auth/wrong-password") {
        alert("Incorrect password. Please try again.");
      } 
      else if (error.code === "auth/invalid-email") {
        alert("Please enter a valid email address.");
      } 
      else if (error.code === "auth/missing-password") {
        alert("Please enter your password.");
      } 
      else {
        alert(error.message);
      }
    });
}

export function createUser(email, name, password) {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up
      const user = userCredential.user;
      console.log(user);

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
