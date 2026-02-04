import * as database from "../database/operator-database.js";

function createMenuItem(stallName) {
  return `<li class="sidebar__menu__item"><a href="#">${stallName}</a></li>`;
}

export async function renderSidebar(centreName) {
  const stalls = await database.getStallsByCentreName(centreName);
  const stallsMenu = document.querySelector("ul.sidebar__menu");

  stallsMenu.innerHTML = "";
  for (const name in stalls) {
    stallsMenu.innerHTML += createMenuItem(name);
  }
}

function redirectToCentresPage(e, centreName) {
  window.location.href = `./operator_centres.html?centreName=${centreName}`;
}

function updateSidebarButton(centreName) {
  const centreSpan = document.getElementById("sidebar__button__centre");
  centreSpan.textContent = centreName;
  centreSpan.parentElement.addEventListener("click", function (e) {
    redirectToCentresPage(e, centreName);
  });
}

async function renderStallInfo(stallName) {
  // TO GET STALLL INFO
  document.getElementById("stall-info__name").textContent = stallName;
  // TODO RENDER STALL INFO
}

async function handleStallSelect(e, centreName) {
  const li = e.currentTarget;
  const stallName = li.textContent;

  updateSidebarButton(centreName);
  await renderStallInfo(stallName);

  const allListitems = document.querySelector("ul.sidebar__menu").children;

  for (const item of allListitems) {
    if (item === li) {
      item.classList.add("sidebar__menu__item--selected");
      continue;
    }
    item.classList.remove("sidebar__menu__item--selected");
  }

  renderStallStatistics(stallName);
}

async function renderStallStatistics(stallName) {
  // TODO
}

export function assignStallSelectHandlers(centreName) {
  const menuItems = document.querySelectorAll(".sidebar__menu__item");
  for (const item of menuItems) {
    item.addEventListener("click", async function (e) {
      await handleStallSelect(e, centreName);
    });
  }
}

export function activateEventForSelectedStallItem(stallName) {
  const listItems = document.querySelector("ul.sidebar__menu").children;
  for (const item of listItems) {
    if (item.textContent === stallName) {
      item.click();
    }
  }
}
