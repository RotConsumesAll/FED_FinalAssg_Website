import {
  db, ref, get,
  query, orderByChild, equalTo
} from "../firebase/index.js";

const ROWS_PER_PAGE = 5;

function last5(key) {
  const m = String(key).match(/(\d{5})$/);
  return m ? m[1] : String(key).slice(-5);
}

function fmtDDMMYYYY(iso) {
  if (!iso) return "";
  const p = String(iso).split("-");
  if (p.length !== 3) return iso;
  return `${p[2]}/${p[1]}/${p[0]}`;
}

function isoToDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function avgOutOf5(scoresObj) {
  if (!scoresObj) return "";
  const vals = Object.values(scoresObj).map(Number).filter(v => !Number.isNaN(v));
  if (!vals.length) return "";
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return `${avg.toFixed(1)} / 5`;
}

function avgNumber(scoresObj) {
  if (!scoresObj) return NaN;
  const vals = Object.values(scoresObj).map(Number).filter(v => !Number.isNaN(v));
  if (!vals.length) return NaN;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function clearTableExceptHeader(table) {
  while (table.rows.length > 1) table.deleteRow(1);
}

function renderPage(table, rows, pageIndex) {
  clearTableExceptHeader(table);

  const start = pageIndex * ROWS_PER_PAGE;
  const end = start + ROWS_PER_PAGE;

  rows.slice(start, end).forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.inspectionId5}</td>
      <td>${r.hawkerCentreName}</td>
      <td>${r.stallUnitNo}</td>
      <td>${r.avgScoreText}</td>
      <td>${r.dateText}</td>
    `;
    table.appendChild(tr);
  });
}

function sortRows(rows, field, dir) {
  const d = dir === "desc" ? -1 : 1;
  return [...rows].sort((a, b) => {
    let va = 0, vb = 0;

    if (field === "id") {
      va = Number(a.inspectionId5);
      vb = Number(b.inspectionId5);
    } else if (field === "score") {
      va = a.avgScoreNum;
      vb = b.avgScoreNum;
    } else if (field === "date") {
      va = a.dateObj ? a.dateObj.getTime() : 0;
      vb = b.dateObj ? b.dateObj.getTime() : 0;
    } else {
      return 0;
    }

    if (Number.isNaN(va)) va = -999999;
    if (Number.isNaN(vb)) vb = -999999;
    return (va - vb) * d;
  });
}

let allRows = [];
let filteredRows = [];
let page = 0;

function updatePager() {
  const table = document.getElementById("dbTable");
  if (!table) return;

  const prev = document.getElementById("dbPrev");
  const next = document.getElementById("dbNext");
  const label = document.getElementById("dbPageLabel");

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ROWS_PER_PAGE));
  page = Math.min(Math.max(page, 0), totalPages - 1);

  renderPage(table, filteredRows, page);

  if (prev) prev.disabled = page === 0;
  if (next) next.disabled = page === totalPages - 1;
  if (label) label.textContent = `${page + 1} / ${totalPages}`;
}

function applyFilters() {
  const hawkerId = document.getElementById("filterHawker")?.value || "";
  const minScoreRaw = document.getElementById("filterScoreMin")?.value;
  const minScore = minScoreRaw === "" ? NaN : Number(minScoreRaw);

  const from = isoToDate(document.getElementById("filterFrom")?.value);
  const to = isoToDate(document.getElementById("filterTo")?.value);

  const sortField = document.getElementById("sortField")?.value || "date";
  const sortDir = document.getElementById("sortDir")?.value || "desc";

  let rows = allRows.filter(r => {
    if (hawkerId && r.hawkerCentreId !== hawkerId) return false;

    if (!Number.isNaN(minScore)) {
      if (Number.isNaN(r.avgScoreNum) || r.avgScoreNum < minScore) return false;
    }

    if (from && r.dateObj && r.dateObj < from) return false;
    if (to && r.dateObj && r.dateObj > to) return false;

    return true;
  });

  rows = sortRows(rows, sortField, sortDir);

  filteredRows = rows;
  page = 0;
  updatePager();
}

function resetDbFilters() {
  document.getElementById("filterHawker") && (document.getElementById("filterHawker").value = "");
  document.getElementById("filterScoreMin") && (document.getElementById("filterScoreMin").value = "");
  document.getElementById("filterFrom") && (document.getElementById("filterFrom").value = "");
  document.getElementById("filterTo") && (document.getElementById("filterTo").value = "");

  const sortField = document.getElementById("sortField");
  const sortDir = document.getElementById("sortDir");

  if (sortField) sortField.value = "date";
  if (sortDir) sortDir.value = "desc";

  filteredRows = sortRows([...allRows], "date", "desc");
  page = 0;
  updatePager();
}

function setupUi(hawkers) {
  const select = document.getElementById("filterHawker");
  if (select) {
    select.innerHTML = `<option value="">All Hawker Centres</option>`;
    Object.entries(hawkers).forEach(([hcId, hc]) => {
      const opt = document.createElement("option");
      opt.value = hcId;
      opt.textContent = hc?.hcName || hcId;
      select.appendChild(opt);
    });
  }

  const filterBtn = document.querySelector(".db-filter-btn");
  const panel = document.getElementById("dbFilterPanel");
  if (filterBtn && panel) {
    filterBtn.addEventListener("click", () => panel.classList.toggle("is-open"));
  }

  document.getElementById("filterApply")?.addEventListener("click", applyFilters);
  document.getElementById("filterReset")?.addEventListener("click", resetDbFilters);

  document.getElementById("dbPrev")?.addEventListener("click", () => { page--; updatePager(); });
  document.getElementById("dbNext")?.addEventListener("click", () => { page++; updatePager(); });
}

function waitForUid() {
  return new Promise((resolve) => {
    const check = () => {
      if (window.__AUTH_UID__) return resolve(window.__AUTH_UID__);
      setTimeout(check, 50);
    };
    check();
  });
}

async function loadDatabaseRows() {
  const myUid = await waitForUid();

  const [inspSnap, stallsSnap, hawkersSnap] = await Promise.all([
    get(query(ref(db, "inspections"), orderByChild("officerId"), equalTo(myUid))),
    get(ref(db, "stalls")),
    get(ref(db, "hawkerCentres")),
  ]);

  const inspections = inspSnap.exists() ? inspSnap.val() : {};
  const stalls = stallsSnap.exists() ? stallsSnap.val() : {};
  const hawkers = hawkersSnap.exists() ? hawkersSnap.val() : {};

  const completed = [];

  Object.entries(inspections).forEach(([inspKey, insp]) => {
    if (!String(inspKey).startsWith("ins_annual_")) return;

    const dateObj = isoToDate(insp.inspectionDate);
    if (!dateObj) return;

    const stallId = insp.stallId || insp.stallid || "";
    const stall = stallId ? stalls[stallId] : null;

    const hcId = stall?.hawkerCentreId || "";
    const hcName = hawkers[hcId]?.hcName || "";

    completed.push({
      inspectionId5: last5(inspKey),
      hawkerCentreId: hcId,
      hawkerCentreName: hcName || hcId || "-",
      stallUnitNo: stall?.stallUnitNo || stallId || "-",
      avgScoreText: avgOutOf5(insp.scores),
      avgScoreNum: avgNumber(insp.scores),
      dateText: fmtDDMMYYYY(insp.inspectionDate),
      dateObj,
    });
  });

  allRows = completed;
  setupUi(hawkers);
  resetDbFilters();
}

loadDatabaseRows().catch((err) => {
  console.error(err);
  alert("Failed to load database records. Check Console.");
});
