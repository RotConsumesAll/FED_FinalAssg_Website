import { app } from "../firebase/app.js";

const validStallNumberLength = 6; // e.g. #01-12

// Elements
const chipContainer = document.querySelector(".filter-row");

// - Inputs
const stallNameInput = document.querySelector("#inputStallName");
const ownerNameInput = document.querySelector("#inputOwnerName");
const prefixInput = document.querySelector("#stallNumberPrefix");
const suffixInput = document.querySelector("#stallNumberSuffix");
const hygieneGradeOptions = document.querySelectorAll(
  "#inputHygieneGradeA,#inputHygieneGradeB,#inputHygieneGradeC,#inputHygieneGradeD",
);
const halalOption = document.querySelector("#checkHalal");
// - Others
const feedback = document.querySelector(".invalid-feedback");
const applyButton = document.querySelector("#apply-button");

function createFilterChip(filterPreText, filterText) {
  return `<button class="filter-row__item">
      <span>${filterPreText}<span class="filter-row__item__filter-value">${filterText}</span></span>
      <img src="../assets/icons/x.svg" alt="Filter icon" height="16" width="16" class="filter-row__item__close">
  </button>`;
}

function getFilterinfo() {
  let stallName = null;
  let ownerName = null;
  if (stallNameInput.value !== "") {
    stallName = stallNameInput.value.toLowerCase();
  }
  if (ownerNameInput.value !== "") {
    ownerName = ownerNameInput.value.toLowerCase();
  }

  let hygieneGradesChosen = [];
  for (const option of hygieneGradeOptions) {
    if (option.checked) {
      hygieneGradesChosen.push(option.value);
    }
  }

  const stallNumber = `#${prefixInput.value}-${suffixInput.value}`;
  const isHalal = halalOption.checked;

  return { stallName, ownerName, hygieneGradesChosen, stallNumber, isHalal };
}

function isStallNumberSubStringValid(substring) {
  // Made with reference to https://www.educative.io/answers/how-to-check-if-a-string-is-a-number-javascript
  return substring.length === 2 && !isNaN(substring);
}

function stallNumberInputHandler(e) {
  const input = e.currentTarget;

  const substring = input.value;
  const isValid = isStallNumberSubStringValid(substring);
  if (isValid) {
    input.classList.remove("is-invalid");
    feedback.style.display = "none";
  } else {
    input.classList.add("is-invalid");
    feedback.style.display = "block";
  }
  return isValid;
}

function checkIfAllFiltersEmpty(filterResults) {
  return (
    filterResults.stallName === null &&
    filterResults.ownerName === null &&
    filterResults.hygieneGradesChosen.length === 0 &&
    filterResults.stallNumber === "#-" &&
    filterResults.isHalal === false
  );
}

function renderStallsWithFilter() {
  const filterResults = getFilterinfo();
  renderFilterChips(filterResults);
  const container = document.getElementById("stall-container");
  const stalls = container.getElementsByTagName("article");

  for (const stall of stalls) {
    if (
      stallFilterMatches(stall, filterResults) ||
      checkIfAllFiltersEmpty(filterResults)
    ) {
      stall.style.display = "flex";
    } else {
      stall.style.display = "none";
    }
  }
}

function stallFilterMatches(stall, filterResults) {
  const actualStallName = stall.querySelector("h2").textContent.toLowerCase();
  const actualOwnerName = stall
    .querySelector(".stall-card__name-and-owner__name")
    .textContent.toLowerCase();
  const actualGrade = stall.querySelector(
    ".stall-card__extra-info__grade",
  ).textContent;
  const actualStallNumber = stall.querySelector(
    ".stall-card__extra-info__element",
  ).textContent;
  const actualIsHalalStatus =
    stall.querySelector(".stall-card__extra-info__element__faded") === null;

  const containsStallName = actualStallName.includes(filterResults.stallName);
  const containsOwnerName = actualOwnerName.includes(filterResults.ownerName);
  const containsHygieneGrade =
    filterResults.hygieneGradesChosen.includes(actualGrade);
  const matchesStallNumber = actualStallNumber === filterResults.stallNumber;
  const matchesIsHalal =
    actualIsHalalStatus === filterResults.isHalal &&
    filterResults.isHalal === true;
  // only show filter if halal status is true

  return (
    containsStallName ||
    containsOwnerName ||
    containsHygieneGrade ||
    matchesStallNumber ||
    matchesIsHalal
  );
}

function removeExistingFilterChips() {
  const existingChips = chipContainer.querySelectorAll(".filter-row__item");
  for (const chip of existingChips) {
    chip.remove();
  }
}

function renderFilterChips(filterResults) {
  removeExistingFilterChips();
  if (filterResults.stallName) {
    chipContainer.innerHTML += createFilterChip(
      "Stall name includes ",
      filterResults.stallName,
    );
  }
  if (filterResults.ownerName) {
    chipContainer.innerHTML += createFilterChip(
      "Owner name includes ",
      filterResults.ownerName,
    );
  }
  if (filterResults.hygieneGradesChosen.length != 0) {
    for (const grade of filterResults.hygieneGradesChosen) {
      chipContainer.innerHTML += createFilterChip("Grade = ", grade);
    }
  }
  if (filterResults.stallNumber.length === validStallNumberLength) {
    chipContainer.innerHTML += createFilterChip(
      "Stall Number = ",
      filterResults.stallNumber,
    );
  }
  if (filterResults.isHalal) {
    chipContainer.innerHTML += createFilterChip("", "Halal");
  }
}

export function assignFilterButtonHandler() {
  applyButton.addEventListener("click", renderStallsWithFilter);
}

export function assignStallNumberInputHandler() {
  for (const input of document.querySelectorAll(
    "#stallNumberPrefix,#stallNumberSuffix",
  )) {
    input.addEventListener("keyup", stallNumberInputHandler);
  }
}

function stallNumberInputGroupHandler(e) {
  const prefixIsValid = isStallNumberSubStringValid(prefixInput.value);
  const suffixIsValid = isStallNumberSubStringValid(suffixInput.value);
  const bothAreEmpty = prefixInput.value === "" && suffixInput.value === "";

  const allValid = (suffixIsValid && prefixIsValid) || bothAreEmpty;
  applyButton.disabled = !allValid;
  feedback.style.display = allValid ? "none" : "block";
  if (bothAreEmpty) {
    prefixInput.classList.remove("is-invalid");
    suffixInput.classList.remove("is-invalid");
  }
}

export function assignStallNumberInputGroupHandler() {
  prefixInput.parentElement.addEventListener(
    "click",
    stallNumberInputGroupHandler,
  );

  suffixInput.parentElement.addEventListener(
    "keyup",
    stallNumberInputGroupHandler,
  );
}
