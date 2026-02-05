import * as database from "../database/operator-database.js";

const licenceTable = document.getElementById("licence-table");
const rentalAgreementCard = document.getElementById("rental-agreement-card");

const SGDollar = new Intl.NumberFormat("en-SG", {
  style: "currency",
  currency: "SGD",
});

const dateFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

// COPY
function getCurrentDate() {
  // see https://www.freecodecamp.org/news/javascript-get-current-date-todays-date-in-js/
  const date = new Date();

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
}

// Licence
function isValid(expiryDateString) {
  const expiryDate = Date.parse(expiryDateString);
  const currentDate = getCurrentDate();
  return Date.parse(currentDate) <= expiryDate;
}

function createLicenceTableRow(licenceType, validity) {
  const row = document.createElement("tr");
  const typeData = document.createElement("td");
  const validityData = document.createElement("td");

  typeData.textContent = licenceType;
  validityData.textContent = validity ? "Valid" : "Expired";

  row.append(typeData, validityData);
  return row;
}

export async function renderLicences(stallId) {
  licenceTable.innerHTML = "";
  const licences = await database.getLicenceByStallId(stallId);
  if (!licences) {
    licenceTable.textContent = "None";
    return;
  }
  for (const licence of Object.values(licences)) {
    const row = createLicenceTableRow(
      licence.type,
      isValid(licence.dateOfExpiry),
    );
    licenceTable.appendChild(row);
  }
}

// Rental agreement
function selectLatestAgreement(agreements) {
  let latestExpiryDate;
  let latestAgreement;
  for (const agreement of Object.values(agreements)) {
    if (!latestExpiryDate || latestExpiryDate < agreement.agrEndDate) {
      latestExpiryDate = Date.parse(agreement.agrEndDate);
      latestAgreement = agreement;
    }
  }
  return latestAgreement;
}

function calcualteDifferenceInMonths(startDate, endDate) {
  let difference = (endDate.getTime() - startDate.getTime()) / 1000;
  difference /= 60 * 60 * 24 * 7 * 4;
  return Math.abs(Math.round(difference));
}

function formateDateToLocal(date) {
  return date.toLocaleDateString("en-SG", dateFormatOptions);
}

export async function renderRentalAgreement(stallId) {
  const rentalAgreements = await database.getRentalAgreementsByStallId(stallId);
  rentalAgreementCard.innerHTML = "";

  const latestAgreement = selectLatestAgreement(rentalAgreements);
  const startDate = new Date(latestAgreement.agrStartDate);
  const endDate = new Date(latestAgreement.agrEndDate);

  const title = document.createElement("h2");
  title.textContent = "Rental Agreement Status";
  const amount = document.createElement("p");
  amount.textContent = SGDollar.format(latestAgreement.rentalPrice);
  const subtitle = document.createElement("p");
  subtitle.textContent = "monthly rent";
  const validityRange = document.createElement("p");
  validityRange.textContent = `${formateDateToLocal(startDate)} - ${formateDateToLocal(endDate)}`;

  const duration = document.createElement("p");
  duration.textContent = `(${calcualteDifferenceInMonths(startDate, endDate)} months)`;
  const status = document.createElement("p");
  status.textContent = "Renewed??";

  rentalAgreementCard.append(
    title,
    amount,
    subtitle,
    validityRange,
    duration,
    status,
  );
}
