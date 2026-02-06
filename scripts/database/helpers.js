import {
  db,
  ref,
  query,
  orderByChild,
  limitToLast,
  onValue,
  equalTo,
  get,
} from "../firebase/database.js";

// General functions to interact with the database

export async function fetchData(path) {
  try {
    const snapshot = await get(ref(db, path));
    if (snapshot.exists()) {
      return snapshot.val();
    }
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return;
  }
}

export async function getObjectsByAttribute(path, key, value) {
  try {
    // In the "Rules" tab of the Firebase Realtime Databse console, you would see this for the node "stalls"
    // "stalls": {
    //   ".indexOn": ["hawkerCentreId", "ownerUid"]
    // },

    // this means you can retrieve stalls WHERE hawkerCentreId = value;
    // this function demonstartes that
    // similar to SELECT * FROM Stalls WHERE hawkerCentreId = value;

    const results = await get(
      query(ref(db, path), orderByChild(key), equalTo(value)),
    );
    if (results.exists()) {
      return results.val();
    }
  } catch (error) {
    console.error(`Error fetching ${path} .onIndex ${key} = ${value}:`, error);
    return;
  }
}

// feel free to add more helper functions here

// new helper function to get roles of stakeholders!
export async function getUserRole(uid) {
  try {
    const roleRef = ref(db, `users/${uid}/role`);
    const snapshot = await get(roleRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.warn("Role not found for user:", uid);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
}
