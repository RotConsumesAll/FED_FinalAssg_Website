import * as database from "../database/operator-database.js";
import { redirectToStallDetailPage } from "./centres-routing-to-stall-detail.js";

function createMenuItem(centreName) {
  return `<li class="sidebar__menu__item"><a href="#">${centreName}</a></li>`;
}

function createStallCard(name, stall) {
  let article = document.createElement("article");
  article.classList.add("stall-card");

  let nameAndOwner = document.createElement("div");
  nameAndOwner.classList.add("stall-card__name-and-owner");

  let h2 = document.createElement("h2");
  h2.textContent = name;

  // TODO query owner name from DB
  let owner = document.createElement("p");
  owner.classList.add("stall-card__name-and-owner__name");
  owner.textContent = "Ms Lee Kok Kiang";

  nameAndOwner.append(h2, owner);

  let extraInfo = document.createElement("div");
  extraInfo.classList.add("stall-card__extra-info");

  let unitNumber = document.createElement("p");
  unitNumber.classList.add("stall-card__extra-info__element");
  unitNumber.textContent = stall.unitNumber;

  // TODO query grade from DB
  let grade = document.createElement("p");
  grade.classList.add(
    "stall-card__extra-info__element",
    "stall-card__extra-info__grade",
    "stall-card__extra-info__grade--C",
  );
  grade.textContent = "C";

  extraInfo.append(unitNumber, grade);
  article.append(nameAndOwner, extraInfo);

  return article;
}

export async function renderSidebar(uid) {
  const hawkerCentres = await database.getHawkerCentresByUID(uid);
  const centresMenu = document.querySelector("ul.sidebar__menu");

  centresMenu.innerHTML = "";
  for (const name in hawkerCentres) {
    centresMenu.innerHTML += createMenuItem(name);
  }
}

function updateSidebarButton(centreName) {
  const centreSpan = document.getElementById("sidebar__button__centre");
  centreSpan.textContent = centreName;
}

async function renderCentreInfo(centreName) {
  const hawkerCentres = await database.getHawkerCentres();

  document.getElementById("centre-info__name").textContent = centreName;
  document.getElementById("centre-info__address").textContent =
    hawkerCentres[centreName].address;
  document.querySelector("img.hawker-centre-image")["src"] =
    hawkerCentres[centreName].image;
}

export async function assignCentreSelectHandlers() {
  const menuItems = document.querySelectorAll(".sidebar__menu__item");
  for (const item of menuItems) {
    item.addEventListener("click", handleCentreSelect);
  }
}

async function handleCentreSelect(e) {
  const li = e.currentTarget;
  const centreName = li.textContent;

  updateSidebarButton(centreName);
  await renderCentreInfo(centreName);

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

  renderStalls(centreName);
}

async function renderStalls(centreName) {
  const stalls = await database.getStallsByCentreName(centreName);
  const container = document.getElementById("stall-container");

  let stallCount = 0;
  container.innerHTML = "";
  for (const name in stalls) {
    let card = createStallCard(name, stalls[name]);
    card.addEventListener("click", redirectToStallDetailPage);
    card.addEventListener("click", function(e){ redirectToStallDetailPage(e, centreName); });

    container.appendChild(card);
    stallCount += 1;
  }

  document.getElementById("centre-info__stall-quantity").textContent =
    stallCount;
}
