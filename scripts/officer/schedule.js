import { db, ref, get, set } from "../firebase/index.js";

const hawkerSelect = document.getElementById("hawkerCentreSelect");
const stallSelect = document.getElementById("stallIdSelect");
const dateInput = document.getElementById("inspectionDate");
const timeInput = document.getElementById("inspectionTime");
const form = document.querySelector("form.form");

let hawkers = {};
let stalls = {};

function clearSelect(el) {
  if (!el) return;
  el.innerHTML = "";
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

function isoToDate(isoDate) {
  const d = new Date(isoDate);
  return Number.isNaN(d.getTime()) ? null : d;
}

function buildFutureDateTime(isoDate, hhmm) {
  const d = isoToDate(isoDate);
  if (!d) return null;

  const parts = String(hhmm).split(":");
  if (parts.length !== 2) return null;

  const hh = Number(parts[0]);
  const mm = Number(parts[1]);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;

  d.setHours(hh, mm, 0, 0);
  return d;
}

function isFuture(dateObj) {
  if (!dateObj) return false;
  return dateObj.getTime() > Date.now();
}

function pad5(n) {
  return String(n).padStart(5, "0");
}

function addOption(selectEl, value, label) {
  const opt = document.createElement("option");
  opt.value = value;
  opt.textContent = label;
  selectEl.appendChild(opt);
}

function getStallDisplay(stallObj, stallKey) {
  const candidates = [
    stallObj?.stallUnitNo,
    stallObj?.unitNo,
    stallObj?.stallNo,
    stallObj?.stallNumber,
    stallObj?.stallID,
  ].filter(Boolean);

  for (const c of candidates) {
    const m = String(c).match(/^\d{2}-\d{2}$/);
    if (m) return m[0];
  }

  for (const c of candidates) {
    const m = String(c).match(/\b\d{2}-\d{2}\b/);
    if (m) return m[0];
  }

  const mk = String(stallKey).match(/\b\d{2}-\d{2}\b/);
  if (mk) return mk[0];

  return null;
}

async function loadHawkersAndStalls() {
  const [hcSnap, stallsSnap] = await Promise.all([
    get(ref(db, "hawkerCentres")),
    get(ref(db, "stalls")),
  ]);

  hawkers = hcSnap.exists() ? hcSnap.val() : {};
  stalls = stallsSnap.exists() ? stallsSnap.val() : {};

  clearSelect(hawkerSelect);

  const hawkerEntries = Object.entries(hawkers).sort((a, b) =>
    (a[1]?.hcName || "").localeCompare(b[1]?.hcName || "")
  );

  hawkerEntries.forEach(([hcId, hc]) => {
    addOption(hawkerSelect, hcId, hc?.hcName || hcId);
  });

  renderStallsForHawker(hawkerSelect.value);
}

function renderStallsForHawker(hcId) {
  stallSelect.innerHTML = "";

  const valid = Object.entries(stalls)
    .filter(([_, s]) => s?.hawkerCentreId === hcId)
    .map(([stallKey, s]) => ({
      stallKey,
      label: getStallDisplay(s, stallKey),
    }))
    .filter(x => x.label !== null) 
    .sort((a, b) => a.label.localeCompare(b.label));

  if (valid.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "No valid stalls (XX-XX) found";
    stallSelect.appendChild(opt);
    return;
  }

  valid.forEach(({ stallKey, label }) => {
    const opt = document.createElement("option");
    opt.value = stallKey;     
    opt.textContent = label;  
    stallSelect.appendChild(opt);
  });
}

hawkerSelect?.addEventListener("change", () => {
  renderStallsForHawker(hawkerSelect.value);
});

async function nextInspectionKeyByMax() {
  const inspSnap = await get(ref(db, "inspections"));
  const inspections = inspSnap.exists() ? inspSnap.val() : {};

  let maxNum = 0;

  for (const key of Object.keys(inspections)) {
    const m = String(key).match(/(\d{5})$/);
    if (m) {
      const n = Number(m[1]);
      if (!Number.isNaN(n)) maxNum = Math.max(maxNum, n);
    }
  }

  const nextNum = maxNum + 1;
  const id5 = pad5(nextNum);
  return { key: `ins_sched_${id5}`, id5 };
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const officerId = await waitForUid(); 

  const hawkerCentreId = hawkerSelect?.value;
  const stallId = stallSelect?.value; 
  const inspectionDate = dateInput?.value; 
  const inspectionTime = timeInput?.value; 

  if (!hawkerCentreId || !stallId || !inspectionDate || !inspectionTime) {
    alert("Please fill in all fields.");
    return;
  }


  const stallObj = stalls[stallId];
  if (!stallObj || stallObj.hawkerCentreId !== hawkerCentreId) {
    alert("Invalid Stall selection for this Hawker Centre.");
    return;
  }

  const dt = buildFutureDateTime(inspectionDate, inspectionTime);
  if (!dt || !isFuture(dt)) {
    alert("Inspection date & time must be in the future.");
    return;
  }

  const { key, id5 } = await nextInspectionKeyByMax();

  await set(ref(db, `inspections/${key}`), {
    officerId,
    stallId,
    hawkerCentreId,
    inspectionDate,
    inspectionTime,
  });

  alert(`Scheduled! New Inspection ID: ${id5}`);

});

loadHawkersAndStalls().catch((err) => {
  console.error(err);
  alert("Failed to load hawker centres / stalls from Firebase RTDB.");
});
