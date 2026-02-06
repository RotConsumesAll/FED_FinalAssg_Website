import { db, get, ref } from "../firebase/index.js";

import { fetchData, getObjectsByAttribute } from "./helpers.js";

export async function getHawkerCentres() {
  return fetchData("/hawkerCentres");
}

export function getManagedCentresByOperatorUID(uid) {
  return getObjectsByAttribute("hawkerCentres", "operatorId", uid);
  // SELECT * FROM /hawkerCentres WHERE operatorId = uid;
}

export function getHawkerCentreByCentreId(centreId) {
  return fetchData(`hawkerCentres/${centreId}`);
}

export async function getStallsByCentreId(centreId) {
  return getObjectsByAttribute("stalls", "hawkerCentreId", centreId);
}

export async function getInspectionByStallId(stallId) {
  return getObjectsByAttribute("inspections", "stallId", stallId);
}

export async function getStallByStallId(stallId) {
  return fetchData(`stalls/${stallId}`);
}

export async function getUserDetails(UID) {
  return fetchData(`/users/${UID}`);
}

export async function getLicenceByStallId(stallId) {
  return getObjectsByAttribute("licences", "stallId", stallId);
}

export async function getRentalAgreementsByStallId(stallId) {
  return getObjectsByAttribute("rentalAgreements", "stallId", stallId);
}

import { fetchData } from "./path-to-general-functions.js";

// new helper function to get roles of stakeholders c:
export async function getUserRole(uid) {
    const role = await fetchData(`users/${uid}/role`);
    if (!role) console.warn("Role not found for user:", uid);
    return role ?? null;
}

// BS
export async function getStallMenu(stallId){
  return fetchData(`menuItems/${stallId}`);
}

export async function getStall(stallId){
  return fetchData(`stalls/${stallId}`); 
}

export async function getFeedbackByStallId(stallId) {
  return getObjectsByAttribute("feedback", "stallId", stallId);
}
