import { db, get, ref } from "../firebase/index.js";

import {
  fetchData,
  getObjectsByAttribute,
  writeDataToPath,
  pushDataToPath,
} from "./helpers.js";

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

export async function getUserRole(uid) {
  const role = await fetchData(`users/${uid}/role`);
  if (!role) console.warn("Role not found for user:", uid);
  return role ?? null;
}

// BS
export async function getStallMenu(stallId) {
  return fetchData(`menuItems/${stallId}`);
}

export async function getStall(stallId) {
  return fetchData(`stalls/${stallId}`);
}

export async function getAllStalls() {
  return fetchData(`stalls`);
}

export async function getPromoStalls() {
  return fetchData(`promotions`);
}

export async function getFeedbackByStallId(stallId) {
  return fetchData(`stalls/${stallId}/feedbacks`);
}

export async function getAllRentalAgreements() {
  return await fetchData("rentalAgreements/");
}

export async function getRentalAgreementById(id) {
  return await fetchData(`rentalAgreements/${id}`);
}

// For operator use. Placeholder values are used where applicable
export async function createNewStall(stallData) {
  const newStallData = {
    stallName: stallData.stallName,
    hawkerCentreId: stallData.hawkerCentreId,
    stallUnitNo: "",
    ownerUid: "",
    image: "",
    stallDesc: "",
    tags: [],
    avgRating: 0,
    reviewCount: 0,
    visitCount: 0,
    feedbacks: {},
  };

  const stallId = await pushDataToPath("stalls", newStallData);
  return stallId;
}

// For operator use. Placeholder values are used where applicable
export async function createNewRentalAgreement(stallId, rentalAgreementData) {
  const newAgreementData = {
    stallId: stallId,
    ownerUid: "",
    rentalPrice: rentalAgreementData.rentalPrice,
    agrStartDate: rentalAgreementData.agrStartDate,
    agrEndDate: rentalAgreementData.agrEndDate,
    agrTermCondition: rentalAgreementData.agrTermCondition,
    status: "Active",
  };

  const agreementId = await pushDataToPath(
    "rentalAgreements",
    newAgreementData,
  );
  return agreementId;
}

// For operator use. Placeholder values are used where applicable
export async function createNewMenuItems(stallId) {
  const emptyMenuItems = {};
  await writeDataToPath(`menuItems/${stallId}`, emptyMenuItems);
}
