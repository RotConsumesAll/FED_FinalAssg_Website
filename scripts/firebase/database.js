import {
  getDatabase,
  ref,
  get,
  set,
  update,
  remove,
  push,
  onValue,
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

import { app } from "./app.js";

export const db = getDatabase(app);
export { ref, get, set, update, remove, push, onValue };
