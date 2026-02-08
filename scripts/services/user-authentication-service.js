import { auth, onAuthStateChanged } from "../firebase/authentication.js";
import { getUserRole } from "../database/meaningful-helpers.js";

// made this check function return a Promise to ensure uid is properly received before resolving it
export function checkUserAndGetUid(role) {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        alert("You are signed out. Redirecting to HawkPortal login page.");
        reject("Not signed in");
        return;
      }

      const uid = user.uid;

      if ((await getUserRole(uid)) !== role) {
        alert("Unauthorised access. Redirecting to HawkPortal login page.");
        reject("Unauthorised");
        return;
      }

      resolve(uid);
    });
  });
}