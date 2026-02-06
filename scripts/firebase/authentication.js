import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

import { app } from "./app.js";

export const auth  = getAuth(app);
export { signInWithEmailAndPassword, createUserWithEmailAndPassword };