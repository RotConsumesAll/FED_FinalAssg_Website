import { getObjectsByAttribute } from "./scripts/database/helpers.js";

// for formatting only
function prettyPrintJSON(JSONObject) {
  return JSON.stringify(JSONObject, null, 2);
}

document.addEventListener("DOMContentLoaded", async function () {
  const ownerUid = "OWNER_001";
  const stallsOwnedBy_ownerUid1 = await getObjectsByAttribute(
    "stalls",
    "ownerUid",
    ownerUid,
  );

  document.getElementById("first-query").textContent =
    `E.g. 1 Stalls owned by ownerUid = ${ownerUid}: `;
  document.getElementById("first-result").textContent = prettyPrintJSON(
    stallsOwnedBy_ownerUid1,
  );

  const hawkerCentreId = "hc_01";
  const stallsInCentre_hc01 = await getObjectsByAttribute(
    "stalls",
    "hawkerCentreId",
    hawkerCentreId,
  );

  document.getElementById("second-query").textContent =
    `Stalls in hawkerCentreId = ${hawkerCentreId}: `;
  document.getElementById("second-result").textContent =
    prettyPrintJSON(stallsInCentre_hc01);
});
