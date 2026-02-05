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


function createFilterChip(filterPreText, filterKey, filterValue) {
  let chip = document.createElement("button");
  chip.classList.add("filter-row__item");
  chip.setAttribute("data-key", filterKey);
  chip.setAttribute("data-value", filterValue);

  let outerSpan = document.createElement("span");
  outerSpan.appendChild(document.createTextNode(filterPreText));

  let innerSpan = document.createElement("span");
  innerSpan.classList.add("filter-row__item__filter-value");
  innerSpan.textContent = filterValue;

  outerSpan.appendChild(innerSpan);
  chip.appendChild(outerSpan);

  let img = document.createElement("img");
  img.setAttribute("src", "../assets/icons/x.svg");
  img.setAttribute("alt", "Filter icon");
  img.setAttribute("height", 16);
  img.setAttribute("width", 16);
  img.classList.add("filter-row__item__close");
  img.addEventListener("click", removeFilterChipHandler);

  chip.appendChild(outerSpan);
  chip.appendChild(img);

  return chip;
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

  let stallNumber = null;
  if (prefixInput.value && suffixInput.value) {
    stallNumber = `#${prefixInput.value}-${suffixInput.value}`;
  }

  const isHalal = halalOption.checked;
  setFilterInfo({
    stallName,
    ownerName,
    hygieneGradesChosen,
    stallNumber,
    isHalal,
  });

  return { stallName, ownerName, hygieneGradesChosen, stallNumber, isHalal };
}

function setFilterInfo(filters) {
  sessionStorage.setItem("stallsFilters", JSON.stringify(filters));
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
    filterResults.stallNumber === null &&
    filterResults.isHalal === false
  );
}

function filterButtonHandler() {
  const filterResults = getFilterinfo();
  renderStallsWithFilter(filterResults);
}

function renderStallsWithFilter(filterResults) {
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
  let chip;
  if (filterResults.stallName) {
    chipContainer.appendChild(
      createFilterChip(
        "Stall name includes ",
        "stallName",
        filterResults.stallName,
      ),
    );
  }
  if (filterResults.ownerName) {
    chipContainer.appendChild(
      createFilterChip(
        "Owner name includes ",
        "ownerName",
        filterResults.ownerName,
      ),
    );
  }
  if (filterResults.hygieneGradesChosen.length != 0) {
    for (const grade of filterResults.hygieneGradesChosen) {
      chipContainer.appendChild(createFilterChip("Grade = ", "grade", grade));
    }
  }
  if (
    filterResults.stallNumber &&
    filterResults.stallNumber.length === validStallNumberLength
  ) {
    chipContainer.appendChild(
      createFilterChip(
        "Stall Number = ",
        "stallNumber",
        filterResults.stallNumber,
      ),
    );
  }
  if (filterResults.isHalal) {
    chipContainer.appendChild(createFilterChip("", "isHalal", "Halal"));
  }
}

function removeFilterChipHandler(e) {
  let stallsFilters = JSON.parse(sessionStorage.getItem("stallsFilters"));
  const chip = e.currentTarget.parentElement;
  const key = chip.getAttribute("data-key");
  const value = chip.getAttribute("data-value");
  const newFilters = getNewFilterAfterRemoval(stallsFilters, key, value);

  renderStallsWithFilter(newFilters);
}

function getNewFilterAfterRemoval(filters, key, value) {
  let newFilters = filters;

  if (key === "isHalal") {
    newFilters[key] = false;
  } else if (key === "grade") {
    newFilters["hygieneGradesChosen"].pop(value);
  } else {
    newFilters[key] = null;
  }
  setFilterInfo(newFilters);
  return newFilters;
}

export function assignFilterButtonHandler() {
  applyButton.addEventListener("click", filterButtonHandler);
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
