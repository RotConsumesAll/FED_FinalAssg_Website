import { db, get, ref } from "../firebase/index.js";

import { fetchData, getObjectsByAttribute } from "./helpers.js";

// Specific
export async function getHawkerCentres() {
  return fetchData("/centres");
}

export function getManagedCentresByOperatorUID(uid) {
  return getObjectsByAttribute("hawkerCentres", "operatorId", uid);
}

export function getHawkerCentreByCentreId(centreId) {
  return fetchData(`hawkerCentres/${centreId}`);
}

export async function getStallsByCentreId(centreId) {
  return getObjectsByAttribute("stalls", "hawkerCentreId", centreId);
}

// export async function getStallsByCentreName(centreName) {
//   const stalls = await fetchData(`/centres/${centreName}/stalls`);

//   let stallsList = {};
//   for (const stallId in stalls) {
//     stallsList[stallId] = stalls[stallId];
//   }

//   return stallsList;
// }

export async function getInspectionByStallId(stallId) {
  return getObjectsByAttribute("inspections", "stallId", stallId);
}

// export async function getInspectionRecordsByHawkerCentre_StallName(
//   centreName,
//   stallName,
// ) {
//   return await fetchData(
//     `/inspectionRecords/${centreName}/stalls/${stallName}`,
//   );
// }

export async function getStallByStallId(stallId) {
  return fetchData(`stalls/${stallId}`);
}

// export async function getStallObject(centreName, stallName) {
//   return fetchData(`/centres/${centreName}/stalls/${stallName}`);
// }

export async function getUserDetails(UID) {
  return fetchData(`/users/${UID}`);
}
