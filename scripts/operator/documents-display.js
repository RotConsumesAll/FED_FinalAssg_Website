import {
  getAllRentalAgreements,
  getHawkerCentreByCentreId,
  getStallByStallId,
  getUserDetails,
} from "../database/meaningful-helpers.js";
import { SGDollar } from "./general-helper.js";
import { removeObjectByPath } from "../database/helpers.js";

const recordContainer = document.querySelector(".record-container");

async function createRentalAgreementRecord(id, recordInfo) {
  const ownerDetails = await getUserDetails(recordInfo.ownerUid);
  if (!ownerDetails) {
    return "";
  }
  const stall = await getStallByStallId(recordInfo.stallId);
  const centre = await getHawkerCentreByCentreId(stall.hawkerCentreId);

  const statusClass =
    recordInfo.status === "Expired"
      ? "record-container__record__validity--expired"
      : "record-container__record__validity--valid";

  const article = document.createElement("article");
  article.classList.add("record-container__record");
  article.dataset.recordid = id;

  // Owner name
  const h2 = document.createElement("h2");
  h2.append("With ");

  const ownerName = document.createElement("span");
  ownerName.classList.add("semi-bold");
  ownerName.textContent = ownerDetails.ownerName;

  h2.appendChild(ownerName);

  // Centre & stall
  const centreInfo = document.createElement("p");
  centreInfo.classList.add(
    "record-container__record__minor-info",
    "record-container__record__minor-info--centre",
  );
  centreInfo.textContent = `${centre.hcName} #${stall.stallUnitNo}`;

  // Rental price
  const rent = document.createElement("p");

  const rentAmount = document.createElement("span");
  rentAmount.classList.add("semi-bold");
  rentAmount.textContent = SGDollar.format(recordInfo.rentalPrice);

  rent.append(rentAmount, " monthly rent");

  // Agreement dates
  const dates = document.createElement("p");

  const startDate = document.createElement("span");
  startDate.classList.add("semi-bold");
  startDate.textContent = recordInfo.agrStartDate;

  const endDate = document.createElement("span");
  endDate.classList.add("semi-bold");
  endDate.textContent = recordInfo.agrEndDate;

  dates.append(startDate, " to ", endDate);

  // Status
  const status = document.createElement("p");
  status.classList.add("record-container__record__validity", statusClass);
  status.textContent = recordInfo.status;

  // Action dropdown
  const dropdown = document.createElement("div");
  dropdown.classList.add("dropdown");

  const dropdownBtn = document.createElement("button");
  dropdownBtn.classList.add("btn", "btn-secondary", "dropdown-toggle");
  dropdownBtn.type = "button";
  dropdownBtn.setAttribute("data-bs-toggle", "dropdown");
  dropdownBtn.setAttribute("aria-expanded", "false");
  dropdownBtn.textContent = "Select an action";

  const dropdownMenu = document.createElement("ul");
  dropdownMenu.classList.add("dropdown-menu");

  const editItem = document.createElement("li");
  const editLink = document.createElement("a");
  editLink.classList.add("dropdown-item", "edit-button");
  editLink.href = "#";
  editLink.textContent = "Edit";
  editItem.appendChild(editLink);

  const deleteItem = document.createElement("li");
  const deleteLink = document.createElement("a");
  deleteLink.classList.add("dropdown-item", "delete-button");
  deleteLink.href = "#";
  deleteLink.textContent = "Delete";
  deleteLink.setAttribute("data-bs-toggle", "modal");
  deleteLink.setAttribute("data-bs-target", "#delete-record");

  deleteItem.appendChild(deleteLink);

  dropdownMenu.append(editItem, deleteItem);
  dropdown.append(dropdownBtn, dropdownMenu);

  // all info
  article.append(h2, centreInfo, rent, dates, status, dropdown);

  return article;
}

// https://blog.logrocket.com/creating-custom-select-dropdown-css/
// export function assignDropDownHandler() {
//   const customSelects = document.querySelectorAll(".select");
//   customSelects.forEach((customSelect) => {
//     const selectButton = customSelect.querySelector(".select__button");
//     const dropdown = customSelect.querySelector(".select__dropdown");
//     const options = dropdown.querySelectorAll("li");
//     const selectedValue = selectButton.querySelector(
//       ".select__button__selected-value",
//     );

//     const toggleDropdown = (expand = null) => {
//       const isOpen =
//         expand !== null ? expand : dropdown.classList.contains("hidden");
//       dropdown.classList.toggle("hidden", !isOpen);
//       selectButton.setAttribute("aria-expanded", isOpen);
//     };
//     selectButton.addEventListener("click", () => {
//       toggleDropdown();
//     });

//     const handleOptionSelect = (option) => {
//       options.forEach((opt) => opt.classList.remove("selected"));
//       option.classList.add("selected");
//       selectedValue.textContent = option.textContent.trim(); // Update selected value
//     };
//     options.forEach((option) => {
//       option.addEventListener("click", (e) => {
//         handleOptionSelect(option);
//         // renderDocuments(e.currentTarget.textContent);
//         renderRentalAgreements();
//         toggleDropdown(false);
//       });
//     });

//     document.addEventListener("click", (event) => {
//       const isOutsideClick = !customSelect.contains(event.target);
//       if (isOutsideClick) {
//         toggleDropdown(false);
//       }
//     });
//   });
// }

export async function renderRentalAgreements() {
  recordContainer.innerHTML = "";
  const documents = await getAllRentalAgreements();

  for (const id of Object.keys(documents)) {
    recordContainer.append(
      await createRentalAgreementRecord(id, documents[id]),
    );
  }
}

function getRecordIdFromListItem(item) {
  const list = item.parentElement;
  const dropdown = list.parentElement;
  const recordCard = dropdown.parentElement;
  return recordCard.getAttribute("data-recordid");
}

function deleteRecord(e) {
  const item = e.target.parentElement;
  const recordId = getRecordIdFromListItem(item);
  sessionStorage.setItem("recordIdInFocus", recordId);
}

function editRecord(e) {
  const item = e.target.parentElement;
  const recordId = getRecordIdFromListItem(item);
  sessionStorage.setItem("recordIdInFocus", recordId);
}

async function handleDeleteConfirmation() {
  const recordId = sessionStorage.getItem("recordIdInFocus");
  console.log("DELETING THIS RECORD WITH ID: ", recordId);
  // removeObjectByPath(`rentalAgreements/${recordId}`);
}

export function assignDeleteHandler() {
  const buttons = document.getElementsByClassName("delete-button");

  for (const button of buttons) {

    button.addEventListener("click", function (e) {
      deleteRecord(e);
    });
  }
}

export function assignEditHandler() {
  const buttons = document.getElementsByClassName("edit-button");
  for (const button of buttons) {
    button.addEventListener("click", function (e) {
      editRecord(e);
    });
  }
}

export function assignDeleteConfirmationHandler() {
  document
    .getElementById("confirm-delete")
    .addEventListener("click", function (e) {
      handleDeleteConfirmation(e);
    });
}
