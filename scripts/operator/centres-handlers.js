import * as database from "../database/operator-database.js";

function createMenuItem(centreName) {
  return `<li class="sidebar__menu__item"><a href="#">${centreName}</a></li>`;
}

function createStallCard(name, stall) {
  return `
    <article class="stall-card">
      <div class="stall-card__name-and-owner">
        <h2>${name}</h2>
        <p class="stall-card__name-and-owner__name">Ms Lee Kok Kiang</p>
      </div>
      <div class="stall-card__extra-info">
        <p class="stall-card__extra-info__element">${stall.unitNumber}</p>
        <p class="stall-card__extra-info__element stall-card__extra-info__grade stall-card__extra-info__grade--C">C</p>
      </div>
    </article>`;
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

  renderStalls(centreName);
}

async function renderStalls(centreName) {
  const stalls = await database.getStallsByCentreName(centreName);
  const container = document.getElementById("stall-container");

  let stallCount = 0;
  container.innerHTML = "";
  for (const name in stalls) {
    container.innerHTML += createStallCard(name, stalls[name]);
    stallCount += 1;
  }

  document.getElementById("centre-info__stall-quantity").textContent =
    stallCount;
}
