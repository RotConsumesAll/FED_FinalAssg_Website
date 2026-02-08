import * as database from "../database/meaningful-helpers.js";
import {
  SGDollar,
  findValidRecord,
  isValid,
  formateDateToLocal,
  calculateAverage,
  calcualteDifferenceInMonths,
  roundTo2DecimalPlaces,
  isWithinLastThreeMonths,
} from "./general-helper.js";

// Elements
const licenceTable = document.getElementById("licence-table");
const rentalAgreementCard = document.getElementById("rental-agreement-card");
const chartCard = document.getElementById("average-score-chart-chart");
const feedbackTable = document.getElementById("feedback-table");
const gradeCard = document.querySelector(".hygiene-grade-card");

// Configurations

const scoreChartConfig = {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Average",
        borderColor: "rgb(255, 9, 9)",
        backgroundColor: "transparent",
        borderWidth: 2,
        data: [],
        hidden: false,
      },
      {
        label: "Hygiene",
        borderColor: "rgb(255, 0, 242)",
        backgroundColor: "transparent",
        borderWidth: 2,
        data: [],
        hidden: true,
      },
      {
        label: "Cleanliness",
        borderColor: "rgb(0, 255, 200)",
        backgroundColor: "transparent",
        borderWidth: 2,
        data: [],
        hidden: true,
      },
      {
        label: "Housekeeping",
        borderColor: "rgb(0, 0, 255)",
        backgroundColor: "transparent",
        borderWidth: 2,
        data: [],
        hidden: true,
      },
    ],
  },
  options: {
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
};

// Licence
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

function createUnavailableRecordNotice() {
  const subtitle = document.createElement("p");
  const subtitleText = document.createTextNode(
    "No rental agreements available.",
  );
  subtitle.append(subtitleText);

  const button = document.createElement("button");
  button.addEventListener("click", function (e) {
    window.location.href = "./rental-agreements.html";
  });
  const text = document.createTextNode("Go to ");

  const span = document.createElement("span");
  span.classList.add("semi-bold");
  span.textContent = "Documents";

  const tailText = document.createTextNode(" to create one");

  button.append(text, span, tailText);

  rentalAgreementCard.append(subtitle, button);
}

export async function renderRentalAgreement(stallId) {
  rentalAgreementCard.innerHTML = "";
  const title = document.createElement("h2");
  title.textContent = "Rental Agreement Status";
  rentalAgreementCard.append(title);

  const rentalAgreements = await database.getRentalAgreementsByStallId(stallId);
  if (!rentalAgreements) {
    createUnavailableRecordNotice();
    return;
  }

  const latestAgreement = selectLatestAgreement(rentalAgreements);

  if (!latestAgreement) {
    createUnavailableRecordNotice();
    return;
  }
  const startDate = new Date(latestAgreement.agrStartDate);
  const endDate = new Date(latestAgreement.agrEndDate);

  const amount = document.createElement("p");
  amount.classList.add("rental__amount");
  amount.textContent = SGDollar.format(latestAgreement.rentalPrice);
  const subtitle = document.createElement("p");
  subtitle.textContent = "monthly rent";
  subtitle.classList.add("rental__subtitle");
  const validityRange = document.createElement("p");
  validityRange.textContent = `${formateDateToLocal(startDate)} - ${formateDateToLocal(endDate)}`;
  validityRange.classList.add("rental__dates");

  const duration = document.createElement("p");
  duration.textContent = `(${calcualteDifferenceInMonths(startDate, endDate)} months)`;
  duration.classList.add("rental__duration");
  const status = document.createElement("p");
  status.textContent = latestAgreement.status;
  status.classList.add(
    "rental__status",
    `rental__status--${latestAgreement.status.toLowerCase()}`,
  );

  rentalAgreementCard.append(amount, subtitle, validityRange, duration, status);
}

// Inspection records
async function renderHygieneGrade(inspectionRecords) {
  gradeCard.classList = "";
  gradeCard.classList.add("figure-card", "figure-card--stand-alone");

  const record = findValidRecord(inspectionRecords);

  const grade = document.getElementById("hygiene-grade");
  const subtitle = document.getElementById("grade-subtitle");
  const expiryDateParagraph = document.getElementById("grade-expiry-p");
  const expiryDate = document.getElementById("grade-expiry");

  if (!record) {
    subtitle.textContent = "Hygiene Grade unavailable";
    grade.style.display = "none";
    expiryDateParagraph.style.display = "none";
    return;
  } else {
    const gradeLetter = record.hygieneGrade;
    gradeCard.classList.add(`hygiene-grade-card--${gradeLetter}`);
    const expiryDate = new Date(record.gradeExpiry);
    grade.textContent = gradeLetter;
    grade.style.display = "flex";
    subtitle.textContent = "Current Hygiene Grade";
    expiryDateParagraph.style.display = "flex";
    expiryDate.textContent = formateDateToLocal(expiryDate);
  }
}

// Score line graphs
function extractScores(inspectionRecords) {
  if (!inspectionRecords) {
    return {};
  }
  let extractedScoresByDate = {};
  for (const record of Object.values(inspectionRecords)) {
    extractedScoresByDate[record.inspectionDate] = record.scores;
  }
  return extractedScoresByDate;
}

function createScoreAxes(scores) {
  let averageScoreAxis = [];
  let hygieneScoreAxis = [];
  let cleanlinessScoreAxis = [];
  let housekeepingScoreAxis = [];

  for (const score of Object.values(scores)) {
    if (!score) {
      continue;
    }
    const scoreList = [score.hygiene, score.cleanliness, score.housekeeping];
    averageScoreAxis.push(calculateAverage(scoreList));
    hygieneScoreAxis.push(score.hygiene);
    cleanlinessScoreAxis.push(score.cleanliness);
    housekeepingScoreAxis.push(score.housekeeping);
  }
  return {
    averageScoreAxis,
    hygieneScoreAxis,
    cleanlinessScoreAxis,
    housekeepingScoreAxis,
  };
}

function createScoreChartConfig(dateAxis, axesData) {
  const config = scoreChartConfig;
  config.data.labels = dateAxis;
  for (let index = 0; index < config.data.datasets.length; index++) {
    config.data.datasets[index].data = Object.values(axesData)[index];
  }
  return config;
}

function resetChartCardHTML(show) {
  if (show) {
    chartCard.innerHTML = `<h2>Average Inspection Scores over Time</h2>
                        <canvas id="average-score-chart"></canvas>
                        <div class="btn-group" role="group" aria-label="scoreSelector" id="score-selector">
                            <button type="button" class="btn btn-primary" id="average-button">Average</button>
                            <button type="button" class="btn btn-primary" id="hygiene-button">Hygiene</button>
                            <button type="button" class="btn btn-primary" id="cleanliness-button">Cleanliness</button>
                            <button type="button" class="btn btn-primary" id="housekeeping-button">Housekeeping</button>
                        </div>`;
  } else {
    chartCard.innerHTML = `<h2>Average Inspection Scores over Time</h2>
                        <p>No scores are available</p>`;
  }
}

async function renderAverageScoreGraph(inspectionRecords) {
  const scoresWithDate = extractScores(inspectionRecords);

  const show = Object.keys(scoresWithDate).length !== 0;

  resetChartCardHTML(show);
  if (!show) {
    return;
  }

  const dateAxis = Object.keys(scoresWithDate);
  const axesData = createScoreAxes(scoresWithDate);

  const canvas = document.getElementById("average-score-chart");
  const chart = new Chart(canvas, createScoreChartConfig(dateAxis, axesData));

  const scoreSelectButtons = document.querySelectorAll(
    "#score-selector button",
  );
  for (const button of scoreSelectButtons) {
    button.addEventListener("click", function (e) {
      handleScoreSelector(e, chart);
    });
  }
}

function handleScoreSelector(e, chart) {
  const selectedScore = e.currentTarget.textContent.trim().toLowerCase();

  for (let index = 0; index < chart.data.datasets.length; index++) {
    const dataset = chart.data.datasets[index];
    const datasetLabel = dataset.label.toLowerCase();
    chart.data.datasets[index].hidden = datasetLabel !== selectedScore;
  }

  chart.update();
}

export async function renderInspectionRecordStatistics(stallId) {
  const inspectionRecords = await database.getInspectionByStallId(stallId);
  await renderHygieneGrade(inspectionRecords);
  await renderAverageScoreGraph(inspectionRecords);
}

// Average customer rating (this week)
function findRatingsOrFeedbackThisWeek(feedbacks, type) {
  let result = [];
  if (feedbacks) {
    for (const feedback of Object.values(feedbacks)) {
      if (isWithinLastThreeMonths(new Date(feedback.createdAt))) {
        switch (type) {
          case "feedback":
            result.push(feedback);
            break;
          case "rating":
            result.push(feedback.rating);
            break;
          default:
            continue;
        }
      }
    }
  }
  return result;
}

async function renderAverageCustomerRating(feedbacks) {
  const ratingList = findRatingsOrFeedbackThisWeek(feedbacks, "rating");
  const averageRating = calculateAverage(ratingList);

  if (isNaN(averageRating)) {
    document.getElementById("average-rating").textContent = "-";
  } else {
    document.getElementById("average-rating").textContent =
      roundTo2DecimalPlaces(averageRating);
  }
}

// Feedback received
function createFeedbackRow(date, rating, comment) {
  const row = document.createElement("tr");
  const dateData = document.createElement("td");
  const ratingData = document.createElement("td");
  const commentData = document.createElement("td");

  if (date !== "-") {
    dateData.textContent = formateDateToLocal(date);
  } else {
    dateData.textContent = "-";
  }

  ratingData.textContent = rating;
  commentData.textContent = comment;

  row.append(dateData, ratingData, commentData);
  return row;
}

async function renderThisWeekFeedback(feedbacks) {
  const feedbacksThisWeek = findRatingsOrFeedbackThisWeek(
    feedbacks,
    "feedback",
  );
  feedbackTable.innerHTML = "";
  if (feedbacksThisWeek.length === 0) {
    feedbackTable.append(createFeedbackRow("-", "-", "-"));
    return;
  }

  for (const feedback of Object.values(feedbacksThisWeek)) {
    const row = createFeedbackRow(
      new Date(feedback.createdAt),
      feedback.rating,
      feedback.comment,
    );
    feedbackTable.appendChild(row);
  }
}

// To handle both rating and feedback
export async function renderRatingAndFeedbackStatistics(stallId) {
  const feedbacks = await database.getFeedbackByStallId(stallId);
  await renderAverageCustomerRating(feedbacks);
  await renderThisWeekFeedback(feedbacks);
}
