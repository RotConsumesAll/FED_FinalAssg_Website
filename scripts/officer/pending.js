import { db, ref, get, update, remove } from "../firebase/index.js";

const PAGE_SIZE = 5;

function waitForUid() {
  return new Promise((resolve) => {
    const check = () => {
      if (window.__AUTH_UID__) return resolve(window.__AUTH_UID__);
      setTimeout(check, 50);
    };
    check();
  });
}

function isoToDDMMYYYY(iso) {
  if (!iso || typeof iso !== "string" || !iso.includes("-")) return "-";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function ddmmyyyyToISO(ddmmyyyy) {
  const parts = String(ddmmyyyy).split("/");
  if (parts.length !== 3) return "";
  const [dd, mm, yyyy] = parts;
  if (!dd || !mm || !yyyy) return "";
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

function isFutureDateTime(dateISO, timeHHMM) {
  if (!dateISO) return false;
  const t = timeHHMM && timeHHMM !== "-" ? timeHHMM : "00:00";
  const dt = new Date(`${dateISO}T${t}:00`);
  return dt.getTime() > Date.now();
}

function safeText(v) {
  return (v === undefined || v === null || v === "") ? "-" : String(v);
}

let allRows = [];
let filteredRows = [];
let page = 1;

function clearTableKeepHeader(table) {
  while (table.rows.length > 1) table.deleteRow(1);
}

function renderPage() {
  const table = document.getElementById("pendingTable");
  if (!table) return;

  clearTableKeepHeader(table);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  if (page > totalPages) page = totalPages;
  if (page < 1) page = 1;

  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filteredRows.slice(start, start + PAGE_SIZE);

  for (const row of pageItems) {
    const tr = document.createElement("tr");
    tr.className = "pending-row";
    tr.dataset.key = row.key;

    const tdH = document.createElement("td");
    tdH.className = "pending-cell pending-hawker";
    tdH.textContent = row.hawkerCentreName || "-";

    const tdS = document.createElement("td");
    tdS.className = "pending-cell pending-stall";
    tdS.textContent = row.stallDisplay || "-";

    const tdD = document.createElement("td");
    tdD.className = "pending-cell pending-date";
    tdD.textContent = isoToDDMMYYYY(row.inspectionDate);

    const tdT = document.createElement("td");
    tdT.className = "pending-cell pending-time";
    tdT.textContent = safeText(row.inspectionTime);

    const tdA = document.createElement("td");
    tdA.className = "pending-cell pending-actions";

    const btnEdit = document.createElement("button");
    btnEdit.type = "button";
    btnEdit.className = "btn-edit";
    btnEdit.textContent = "Edit";

    const btnRemove = document.createElement("button");
    btnRemove.type = "button";
    btnRemove.className = "btn-remove";
    btnRemove.textContent = "Remove";

    tdA.appendChild(btnEdit);
    tdA.appendChild(btnRemove);

    tr.appendChild(tdH);
    tr.appendChild(tdS);
    tr.appendChild(tdD);
    tr.appendChild(tdT);
    tr.appendChild(tdA);

    table.appendChild(tr);
  }

  const lbl = document.getElementById("pendingPageLabel");
  if (lbl) lbl.textContent = `${page} / ${Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))}`;

  const prev = document.getElementById("pendingPrev");
  const next = document.getElementById("pendingNext");

  if (prev) prev.disabled = page <= 1;
  if (next) next.disabled = page >= Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
}

async function loadPendingRows() {
  const myUid = await waitForUid();

  const [hcSnap, stallsSnap, insSnap] = await Promise.all([
    get(ref(db, "hawkerCentres")),
    get(ref(db, "stalls")),
    get(ref(db, "inspections")),
  ]);

  const hawkerCentres = hcSnap.exists() ? hcSnap.val() : {};
  const stalls = stallsSnap.exists() ? stallsSnap.val() : {};
  const inspections = insSnap.exists() ? insSnap.val() : {};

  const rows = [];

  for (const key of Object.keys(inspections || {})) {
    if (!key.startsWith("ins_sched_")) continue;

    const obj = inspections[key] || {};
    if (obj.officerId !== myUid) continue;

    const hawkerCentreId = obj.hawkerCentreId || "";
    const stallId = obj.stallId || obj.stallid || "";

    const hawkerCentreName =
      hawkerCentreId && hawkerCentres[hawkerCentreId]
        ? (hawkerCentres[hawkerCentreId].hcName || hawkerCentreId)
        : (hawkerCentreId || "-");

    const stallDisplay =
      stallId && stalls[stallId]
        ? (stalls[stallId].stallUnitNo || stallId)
        : (stallId || "-");

    rows.push({
      key,
      inspectionDate: obj.inspectionDate || "",
      inspectionTime: obj.inspectionTime || "-",
      hawkerCentreName,
      stallDisplay,
    });
  }

  rows.sort((a, b) => (a.inspectionDate < b.inspectionDate ? 1 : -1));

  allRows = rows;
  filteredRows = [...allRows];
  page = 1;
  renderPage();
}

function setRowEditMode(tr, isEditing) {
  const btnEdit = tr.querySelector(".btn-edit");
  const dateCell = tr.querySelector(".pending-date");
  const timeCell = tr.querySelector(".pending-time");
  if (!btnEdit || !dateCell || !timeCell) return;

  if (isEditing) {
    btnEdit.textContent = "Done";
    btnEdit.classList.add("is-done");

    const currentDDMM = dateCell.textContent.trim();
    const currentISO = currentDDMM.includes("/") ? ddmmyyyyToISO(currentDDMM) : "";

    dateCell.dataset.prev = currentDDMM;
    timeCell.dataset.prev = timeCell.textContent.trim();

    dateCell.innerHTML = "";
    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.className = "pending-inline-input";
    dateInput.value = currentISO;
    dateCell.appendChild(dateInput);

    timeCell.innerHTML = "";
    const timeInput = document.createElement("input");
    timeInput.type = "time";
    timeInput.className = "pending-inline-input";
    const prevTime = timeCell.dataset.prev;
    timeInput.value = (prevTime && prevTime !== "-" ? prevTime : "");
    timeCell.appendChild(timeInput);
  } else {
    btnEdit.textContent = "Edit";
    btnEdit.classList.remove("is-done");
    dateCell.textContent = dateCell.dataset.prev || "-";
    timeCell.textContent = timeCell.dataset.prev || "-";
  }
}

async function handleDoneUpdate(tr) {
  const key = tr.dataset.key;
  if (!key) return;

  const dateInput = tr.querySelector(".pending-date input[type='date']");
  const timeInput = tr.querySelector(".pending-time input[type='time']");

  const newDateISO = dateInput ? dateInput.value : "";
  const newTime = timeInput ? timeInput.value : "";
  const timeToSave = newTime ? newTime : "-";

  if (!newDateISO) {
    alert("Please choose a date.");
    return;
  }

  if (!isFutureDateTime(newDateISO, newTime || "00:00")) {
    alert("Inspection date/time must be in the future.");
    return;
  }

  await update(ref(db, `inspections/${key}`), {
    inspectionDate: newDateISO,
    inspectionTime: timeToSave,
  });

  tr.querySelector(".pending-date").textContent = isoToDDMMYYYY(newDateISO);
  tr.querySelector(".pending-time").textContent = timeToSave;

  const btnEdit = tr.querySelector(".btn-edit");
  btnEdit.textContent = "Edit";
  btnEdit.classList.remove("is-done");
}

function wirePager() {
  document.getElementById("pendingPrev")?.addEventListener("click", () => {
    page -= 1;
    renderPage();
  });
  document.getElementById("pendingNext")?.addEventListener("click", () => {
    page += 1;
    renderPage();
  });
}

function wireRowActions() {
  const table = document.getElementById("pendingTable");
  if (!table) return;

  table.addEventListener("click", async (e) => {
    const btn = e.target;
    if (!(btn instanceof HTMLElement)) return;

    const tr = btn.closest("tr");
    if (!tr || !tr.dataset.key) return;

    if (btn.classList.contains("btn-remove")) {
      const key = tr.dataset.key;
      if (!confirm("Remove this pending inspection?")) return;

      await remove(ref(db, `inspections/${key}`));

      allRows = allRows.filter(r => r.key !== key);
      filteredRows = filteredRows.filter(r => r.key !== key);
      renderPage();
      return;
    }

    if (btn.classList.contains("btn-edit")) {
      const isDone = btn.classList.contains("is-done");
      if (!isDone) setRowEditMode(tr, true);
      else {
        try {
          await handleDoneUpdate(tr);
        } catch (err) {
          console.error(err);
          alert("Failed to update. Check Console.");
        }
      }
    }
  });
}

function wireFilterToggleOnly() {
  const btn = document.getElementById("pendingFilterBtn");
  const panel = document.getElementById("pendingFilterPanel");
  if (!btn || !panel) return;
  btn.addEventListener("click", () => panel.classList.toggle("is-open"));
}

(async function initPending() {
  wirePager();
  wireRowActions();
  wireFilterToggleOnly();

  try {
    await loadPendingRows();
  } catch (err) {
    console.error(err);
    alert("Failed to load pending inspections.");
  }
})();
