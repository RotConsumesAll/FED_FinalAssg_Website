import {
  getAllRentalAgreements,
  getHawkerCentreByCentreId,
  getStallByStallId,
  getUserDetails,
  getHawkerCentres,
  createNewStall,
  createNewRentalAgreement,
  createNewMenuItems,
  getRentalAgreementById,
  updateRentalAgreementPrice,
} from "../database/meaningful-helpers.js";
import { SGDollar } from "./general-helper.js";
import { removeObjectByPath } from "../database/helpers.js";

const recordContainer = document.querySelector(".record-container");

async function createRentalAgreementRecord(id, recordInfo) {
  const ownerDetails = await getUserDetails(recordInfo.ownerUid);

  const stall = await getStallByStallId(recordInfo.stallId);
  const centre = await getHawkerCentreByCentreId(stall.hawkerCentreId);

  const statusClass =
    recordInfo.status === "Expired"
      ? "record-container__record__validity--expired"
      : "record-container__record__validity--valid";

  const article = document.createElement("article");
  article.classList.add("record-container__record");
  article.dataset.recordid = id;

  // Stall name
  const stallName = document.createElement("h2");
  stallName.textContent = `${stall.stallName}`;

  // Centre
  const centreInfo = document.createElement("p");
  centreInfo.classList.add(
    "record-container__record__minor-info",
    "record-container__record__minor-info--centre",
  );
  centreInfo.textContent = centre.hcName;

  // Owner name
  const ownerName = document.createElement("p");
  ownerName.classList.add("record-container__record__minor-info");

  if (ownerDetails.ownerName) {
    ownerName.append(document.createTextNode(ownerDetails.ownerName));
  } else {
    ownerName.append(document.createTextNode("Owner not assigned"));
  }

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
  editLink.setAttribute("data-bs-toggle", "modal");
  editLink.setAttribute("data-bs-target", "#edit-rental-price-modal");
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
  article.append(
    stallName,
    centreInfo,
    ownerName,
    rent,
    dates,
    status,
    dropdown,
  );

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

  assignDeleteHandler();
  assignEditHandler();
  assignDeleteConfirmationHandler();
}

function getRecordIdFromListItem(item) {
  const list = item.parentElement;
  const dropdown = list.parentElement;
  const recordCard = dropdown.parentElement;
  return recordCard.getAttribute("data-recordid");
}

function saveRecordId(e) {
  const item = e.target.parentElement;
  const recordId = getRecordIdFromListItem(item);
  sessionStorage.setItem("recordIdInFocus", recordId);
}

async function handleDeleteConfirmation() {
  const recordId = sessionStorage.getItem("recordIdInFocus");
  const recordDetail = await getRentalAgreementById(recordId);
  const stallId = recordDetail.stallId;
  removeObjectByPath(`rentalAgreements/${recordId}`);
  removeObjectByPath(`menuItems/${stallId}`);
  removeObjectByPath(`stalls/${stallId}`);
  alert("Deleted rental agreement and stall associated.");
  await renderRentalAgreements();
}

export function assignDeleteHandler() {
  const buttons = document.getElementsByClassName("delete-button");

  for (const button of buttons) {
    button.addEventListener("click", function (e) {
      saveRecordId(e);
    });
  }
}

export function assignEditHandler() {
  const buttons = document.getElementsByClassName("edit-button");
  for (const button of buttons) {
    button.addEventListener("click", async function (e) {
      e.preventDefault();
      saveRecordId(e);
      
      // Get and show name of stall being edited
      const agreementId = sessionStorage.getItem("recordIdInFocus");
      if (agreementId) {
        try {
          const agreement = await getRentalAgreementById(agreementId);
          const stall = await getStallByStallId(agreement.stallId);
          document.getElementById("stallNameBeingEdited").textContent = stall.stallName;
        } catch (error) {
          console.error("Error fetching stall name:", error);
        }
      }
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

export function assignCreateStallHandler() {
  const form = document.getElementById("createStallForm");
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const hawkerCentreName = document.getElementById("hawkerCentreName").value;
    const stallName = document.getElementById("stallName").value;
    const rentalPrice = document.getElementById("rentalPrice").value;
    const agrStartDate = document.getElementById("agrStartDate").value;
    const agrEndDate = document.getElementById("agrEndDate").value;
    const agrTermCondition = document.getElementById("agrTermCondition").value;

    // Validation of input values
    if (!hawkerCentreName) {
      alert("Please select a hawker centre");
      return;
    }

    if (!stallName || stallName.trim() === "") {
      alert("Please enter a stall name");
      return;
    }

    if (!rentalPrice || parseFloat(rentalPrice) <= 0) {
      alert("Please enter a valid rental price");
      return;
    }

    if (!agrStartDate) {
      alert("Please enter an agreement start date");
      return;
    }

    if (!agrEndDate) {
      alert("Please enter an agreement end date");
      return;
    }

    const startDate = new Date(agrStartDate);
    const endDate = new Date(agrEndDate);

    if (isNaN(startDate.getTime())) {
      alert("Please enter a valid start date");
      return;
    }

    if (isNaN(endDate.getTime())) {
      alert("Please enter a valid end date");
      return;
    }

    if (startDate >= endDate) {
      alert("Agreement end date must be after the start date");
      return;
    }

    if (!agrTermCondition || agrTermCondition.trim() === "") {
      alert("Please enter agreement terms and conditions");
      return;
    }

    try {
      // Create new stall
      const stallId = await createNewStall({
        stallName: stallName,
        hawkerCentreId: hawkerCentreName,
      });

      // Create rental agreement for stall
      const agreementId = await createNewRentalAgreement(stallId, {
        rentalPrice: parseFloat(rentalPrice),
        agrStartDate: agrStartDate,
        agrEndDate: agrEndDate,
        agrTermCondition: agrTermCondition,
      });

      // Create empty menu items for stall
      await createNewMenuItems(stallId);

      alert("Stall and rental agreement created successfully!");

      form.reset();

      document.getElementById("close-create").click();
      await renderRentalAgreements();
    } catch (error) {
      console.error("Error creating stall:", error);
      alert("An error occurred while creating the stall. Please try again.");
    }
  });
}

export async function populateHawkerCentreDropdown(uid) {
  const select = document.getElementById("hawkerCentreName");
  const hawkerCentres = await getHawkerCentres();

  // Clear existing options except the default one
  while (select.options.length > 1) {
    select.remove(1);
  }

  // Add options from database
  for (const [centreId, centreData] of Object.entries(hawkerCentres)) {
    if (centreData.operatorId !== uid) {
      continue;
    }
    const option = document.createElement("option");
    option.value = centreId;
    option.textContent = centreData.hcName;
    select.appendChild(option);
  }
}

export function assignEditRentalPriceHandler() {
  const form = document.getElementById("editRentalPriceForm");
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const newRentalPrice = document.getElementById("editRentalPrice").value;

    // Validation of input value
    if (!newRentalPrice || newRentalPrice.trim() === "") {
      alert("Please enter a new rental price");
      return;
    }

    const priceAsNumber = parseFloat(newRentalPrice);
    if (isNaN(priceAsNumber) || priceAsNumber <= 0) {
      alert("Please enter a valid rental price (must be greater than 0)");
      return;
    }

    try {
      const agreementId = sessionStorage.getItem("recordIdInFocus");

      if (!agreementId) {
        alert("Error: No rental agreement selected.");
        return;
      }

      await updateRentalAgreementPrice(agreementId, priceAsNumber);

      alert("Rental price updated successfully!");

      form.reset();

      const modal = document.getElementById("edit-rental-price-modal");
      const bootstrapModal = bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }

      await renderRentalAgreements();
    } catch (error) {
      console.error("Error updating rental price:", error);
      alert("An error occurred while updating the rental price. Please try again.");
    }
  });
}
