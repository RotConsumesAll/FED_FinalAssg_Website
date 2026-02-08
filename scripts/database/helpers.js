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

export async function removeObjectByPath(path) {
  try {
    await remove(ref(db, path));
  } catch (error) {
    console.error(`Unable to remove object at path ${path}`, error);
    return;
  }
}
