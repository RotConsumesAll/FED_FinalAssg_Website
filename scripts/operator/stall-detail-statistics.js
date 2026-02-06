import * as database from "../database/meaningful-helpers.js";
import {
  findValidRecord,
  isValid,
  formateDateToLocal,
  calculateAverage,
  calcualteDifferenceInMonths,
  isDateInThisWeek,
  roundTo2DecimalPlaces,
} from "./general-helper.js";

// Elemeents
const licenceTable = document.getElementById("licence-table");
const rentalAgreementCard = document.getElementById("rental-agreement-card");
const scoreSelectButtons = document.getElementById("score-selector").children;

// Configurations
const SGDollar = new Intl.NumberFormat("en-SG", {
  style: "currency",
  currency: "SGD",
});

const chartCard = document.getElementById("average-score-chart-chart");

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

export async function renderRentalAgreement(stallId) {
  const rentalAgreements = await database.getRentalAgreementsByStallId(stallId);
  rentalAgreementCard.innerHTML = "";

  const latestAgreement = selectLatestAgreement(rentalAgreements);
  const startDate = new Date(latestAgreement.agrStartDate);
  const endDate = new Date(latestAgreement.agrEndDate);

  const title = document.createElement("h2");
  title.textContent = "Rental Agreement Status";
  const amount = document.createElement("p");
  amount.textContent = SGDollar.format(latestAgreement.rentalPrice);
  const subtitle = document.createElement("p");
  subtitle.textContent = "monthly rent";
  const validityRange = document.createElement("p");
  validityRange.textContent = `${formateDateToLocal(startDate)} - ${formateDateToLocal(endDate)}`;

  const duration = document.createElement("p");
  duration.textContent = `(${calcualteDifferenceInMonths(startDate, endDate)} months)`;
  const status = document.createElement("p");
  status.textContent = "Renewed??";

  rentalAgreementCard.append(
    title,
    amount,
    subtitle,
    validityRange,
    duration,
    status,
  );
}

// Inspection records
async function renderHygieneGrade(inspectionRecords) {
  const record = findValidRecord(inspectionRecords);

  document.getElementById("hygiene-grade").textContent = record.hygieneGrade;
  const expiryDate = new Date(record.gradeExpiry);
  document.getElementById("grade-expiry").textContent =
    formateDateToLocal(expiryDate);
}

// Score line graphs
function extractScores(inspectionRecords) {
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

function resetChartCardHTML() {
  chartCard.innerHTML = `<h2>Average Inspection Scores over Time</h2>
                        <canvas id="average-score-chart"></canvas>
                        <div class="btn-group" role="group" aria-label="scoreSelector" id="score-selector">
                            <button type="button" class="btn btn-primary" id="average-button">Average</button>
                            <button type="button" class="btn btn-primary" id="hygiene-button">Hygiene</button>
                            <button type="button" class="btn btn-primary" id="cleanliness-button">Cleanliness</button>
                            <button type="button" class="btn btn-primary" id="housekeeping-button">Housekeeping</button>
                        </div>`;
}

function showScoreSelectButtons(show) {
  for (const button of scoreSelectButtons) {
    button.style.display = show ? "flex" : "none";
  }
}

async function renderAverageScoreGraph(inspectionRecords) {
  const scoresWithDate = extractScores(inspectionRecords);
  if (Object.keys(scoresWithDate).length === 0) {
    showScoreSelectButtons(false);
    return;
  } else {
    showScoreSelectButtons(true);
  }

  const dateAxis = Object.keys(scoresWithDate);
  const axesData = createScoreAxes(scoresWithDate);

  resetChartCardHTML();

  const canvas = document.getElementById("average-score-chart");
  const chart = new Chart(canvas, createScoreChartConfig(dateAxis, axesData));

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
function findFeedbackForThisWeek(feedbacks) {
  let ratingsThisWeek = [];
  if (feedbacks) {
    for (const feedback of Object.values(feedbacks)) {
      if (isDateInThisWeek(feedback.fbkDate)) {
        ratingsThisWeek.push(feedback.fbkRating);
      }
    }
  }
  return ratingsThisWeek;
}

export async function renderAverageCustomerRating(stallId) {
  const feedbacks = await database.getFeedbackByStallId(stallId);
  const ratingList = findFeedbackForThisWeek(feedbacks);
  const averageRating = calculateAverage(ratingList);

  if (isNaN(averageRating)) {
    document.getElementById("average-rating").textContent = "-";
  } else {
    document.getElementById("average-rating").textContent =
      roundTo2DecimalPlaces(averageRating);
  }
}
