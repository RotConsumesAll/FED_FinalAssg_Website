import * as database from "../database/operator-database.js";

function createMenuItem(stallId, stallName) {
  return `<li class="sidebar__menu__item" data-stallid="${stallId}"><a href="#">${stallName}</a></li>`;
}

export async function renderSidebar(centreId) {
  const stalls = await database.getStallsByCentreId(centreId);
  const stallsMenu = document.querySelector("ul.sidebar__menu");

  stallsMenu.innerHTML = "";
  for (const stallId in stalls) {
    stallsMenu.innerHTML += createMenuItem(stallId, stalls[stallId].stallName);
  }
}

function redirectToCentresPage(e, centreId) {
  window.location.href = `./operator_centres.html?centreId=${centreId}`;
}

function updateSidebarButton(centreId, centreName) {
  const centreSpan = document.getElementById("sidebar__button__centre");
  centreSpan.textContent = centreName;
  centreSpan.parentElement.addEventListener("click", function (e) {
    redirectToCentresPage(e, centreId);
  });
}

async function renderStallTopInfo(stallId) {
  // TO GET STALLL INFO
  const stall = await database.getStallByStallId(stallId);
  const owner = await database.getUserDetails(stall.ownerUid);

  document.getElementById("stall-info__name").textContent = stall.stallName;
  document.getElementById("stall-info__ownerName").textContent =
    owner.ownerName;
  document.getElementById("stall-info__stall-unitNumber").textContent =
    `#${stall.stallUnitNo}`;
  // const image = document.querySelector("img.stall-image");
  // image["src"] = "";
}

// STOPPED HERE 1
async function handleStallSelect(e, centreId) {
  const li = e.currentTarget;
  const stallId = li.getAttribute("data-stallid");

  const centre = await database.getHawkerCentreByCentreId(centreId);

  updateSidebarButton(centreId, centre.hcName);
  await renderStallTopInfo(stallId);

  const allListitems = document.querySelector("ul.sidebar__menu").children;

  for (const item of allListitems) {
    if (item === li) {
      item.classList.add("sidebar__menu__item--selected");
      continue;
    }
    item.classList.remove("sidebar__menu__item--selected");
  }

  // renderStallStatistics(centreName, stallName);
}

// async function renderStallStatistics(centreName, stallName) {
//   const stall = await database.getStallObject(centreName, stallName);
//   const unitNumber = document.getElementById("stall-info__stall-unitNumber");
//   unitNumber.textContent = stall.unitNumber;

//   const ownerNameElement = document.getElementById("stall-info__ownerName");
//   const owner = await database.getUserDetails(stall.ownerUID);
//   ownerNameElement.textContent = owner.ownerName;
// }

export function assignStallSelectHandlers(centreId) {
  const menuItems = document.querySelectorAll(".sidebar__menu__item");
  for (const item of menuItems) {
    item.addEventListener("click", async function (e) {
      await handleStallSelect(e, centreId);
    });
  }
}

export function activateEventForSelectedStallItem(stallId) {
  const listItems = document.querySelector("ul.sidebar__menu").children;
  for (const item of listItems) {
    const listItemStallId = item.getAttribute("data-stallid");
    if (listItemStallId === stallId) {
      item.click();
    }
  }
}
