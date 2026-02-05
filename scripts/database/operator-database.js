import { db, get, ref } from "../firebase/index.js";

// General
async function fetchData(path) {
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

// Specific
export async function getHawkerCentres() {
  return fetchData("/centres");
}

async function getManagedCentresByUID(uid) {
  return fetchData(`/users/${uid}/managedCentres`);
}

export async function getHawkerCentresByUID(uid) {
  const centreNames = await getManagedCentresByUID(uid);
  const allCentres = await getHawkerCentres();

  let managedCentres = {};
  for (const name of centreNames) {
    managedCentres[name] = allCentres[name];
  }

  return managedCentres;
}

export async function getStallsByCentreName(centreName) {
  const stalls = await fetchData(`/centres/${centreName}/stalls`);

  let stallsList = {};
  for (const stallId in stalls) {
    stallsList[stallId] = stalls[stallId];
  }

  return stallsList;
}

export async function getInspectionRecordsByHawkerCentre_StallName(centreName, stallName) {
  const inspectionRecords = await fetchData(`/inspectionRecords/${centreName}/stalls/${stallName}`);
}