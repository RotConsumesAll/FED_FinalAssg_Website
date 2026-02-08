import * as database from "../database/meaningful-helpers.js";
import { redirectToStallDetailPage } from "./centres-routing-to-stall-detail.js";
import { findValidRecord } from "./general-helper.js";

function createMenuItem(centreId, centreName) {
  return `<li class="sidebar__menu__item" data-centreid="${centreId}"><a href="#">${centreName}</a></li>`;
}

function createStallCard(stall, ownerName, grade) {
  const article = document.createElement("article");
  article.classList.add("stall-card");

  const nameAndOwner = document.createElement("div");
  nameAndOwner.classList.add("stall-card__name-and-owner");

  const h2 = document.createElement("h2");
  h2.textContent = stall.stallName;

  const owner = document.createElement("p");
  owner.classList.add("stall-card__name-and-owner__name");
  owner.textContent = ownerName;

  nameAndOwner.append(h2, owner);

  const extraInfo = document.createElement("div");
  extraInfo.classList.add("stall-card__extra-info");

  const unitNumber = document.createElement("p");
  unitNumber.classList.add("stall-card__extra-info__element");
  unitNumber.textContent = `#${stall.stallUnitNo}`;

  const gradeElement = document.createElement("p");
  gradeElement.classList.add(
    "stall-card__extra-info__element",
    "stall-card__extra-info__grade",
  );
  if (!grade) {
    gradeElement.textContent = "-";
  } else {
    gradeElement.textContent = grade;
    gradeElement.classList.add(`stall-card__extra-info__grade--${grade}`);
  }

  extraInfo.append(unitNumber, gradeElement);
  article.append(nameAndOwner, extraInfo);

  return article;
}

export async function renderSidebar(uid) {
  const hawkerCentres = await database.getManagedCentresByOperatorUID(uid);
  const centresMenu = document.querySelector("ul.sidebar__menu");

  centresMenu.innerHTML = "";
  for (const centreId in hawkerCentres) {
    const centre = hawkerCentres[centreId];
    centresMenu.innerHTML += createMenuItem(centreId, centre.hcName);
  }
}

async function renderCentreInfo(centreId) {
  const hawkerCentre = await database.getHawkerCentreByCentreId(centreId);

  document.getElementById("centre-info__name").textContent =
    hawkerCentre.hcName;
  document.getElementById("centre-info__address").textContent =
    hawkerCentre.hcAddress;
  document.querySelector("img.hawker-centre-image")["src"] = hawkerCentre.image;
}

export async function assignCentreSelectHandlers() {
  const menuItems = document.querySelectorAll(".sidebar__menu__item");
  for (const item of menuItems) {
    item.addEventListener("click", handleCentreSelect);
  }
}

async function handleCentreSelect(e) {
  const li = e.currentTarget;
  const centreId = li.getAttribute("data-centreid");

  await renderCentreInfo(centreId);

  const allListitems = document.querySelector("ul.sidebar__menu").children;

  for (const item of allListitems) {
    if (item === li) {
      item.classList.add("sidebar__menu__item--selected");
      continue;
    }
    item.classList.remove("sidebar__menu__item--selected");
  }

  // clear search bar
  document.querySelector("#centre-search").value = "";

  await renderStalls(centreId);
}

async function renderStalls(centreId) {
  const stalls = await database.getStallsByCentreId(centreId);
  const container = document.getElementById("stall-container");

  let stallCount = 0;
  container.innerHTML = "";

  // Create cards for stalls
  for (const stallId in stalls) {
    const stall = stalls[stallId];

    const owner = await database.getUserDetails(stall.ownerUid);
    let ownerName;
    if (!owner) {
      ownerName = "Unavailable";
    } else {
      ownerName = owner.ownerName;
    }

    const inspectionRecords = await database.getInspectionByStallId(stallId);
    const recordFound = findValidRecord(inspectionRecords);
    const grade = recordFound ? recordFound.hygieneGrade : null;

    let card = createStallCard(stall, ownerName, grade);
    card.addEventListener("click", function (e) {
      redirectToStallDetailPage(e, centreId, stallId);
    });

    container.appendChild(card);
    stallCount += 1;
  }

  document.getElementById("centre-info__stall-quantity").textContent =
    stallCount;
}

// Renders the page for a certain centre
export function activateEventForSelectedCentreItem(centreId) {
  const listItems = document.querySelector("ul.sidebar__menu").children;
  for (const item of listItems) {
    const listItemCentreId = item.getAttribute("data-centreid");
    if (listItemCentreId === centreId) {
      item.click();
    }
  }
}
