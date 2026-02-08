import { db, ref, get, set, remove } from "../firebase/index.js";

function waitForUid() {
  return new Promise((resolve) => {
    const check = () => {
      if (window.__AUTH_UID__) return resolve(window.__AUTH_UID__);
      setTimeout(check, 50);
    };
    check();
  });
}

function pad5(x) {
  return String(x).replace(/\D/g, "").padStart(5, "0").slice(-5);
}

function toISODate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function gradeExpiryFromTodayMinus1() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setFullYear(d.getFullYear() + 1);
  d.setDate(d.getDate() - 1);
  return toISODate(d);
}

function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return toISODate(d);
}

function gradeFromPercent(pct) {
  if (pct >= 85) return "A";
  if (pct >= 70) return "B";
  if (pct >= 50) return "C";
  return "D";
}

document.getElementById("inspectionSubmitForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const myUid = await waitForUid();

  const rawId = document.getElementById("inspectionId")?.value || "";
  const inspectionId = pad5(rawId);

  const cleanliness = Number(document.getElementById("scoreFood")?.value); 
  const housekeeping = Number(document.getElementById("scoreClean")?.value);
  const hygiene = Number(document.getElementById("scorePest")?.value);
  const remarksText = (document.getElementById("remarksText")?.value || "").trim();

  if (!inspectionId) {
    alert("Please enter Inspection ID.");
    return;
  }
  if (![cleanliness, housekeeping, hygiene].every(n => Number.isFinite(n) && n >= 1 && n <= 5)) {
    alert("Scores must be between 1 and 5.");
    return;
  }

  const schedKey = `ins_sched_${inspectionId}`;
  const annualKey = `ins_annual_${inspectionId}`;

  const schedPath = `inspections/${schedKey}`;
  const annualPath = `inspections/${annualKey}`;

  try {
    const schedSnap = await get(ref(db, schedPath));
    if (!schedSnap.exists()) {
      alert(`Scheduled inspection not found: ${schedKey}`);
      return;
    }

    const sched = schedSnap.val();

    if (sched.officerId !== myUid) {
      alert("You are not assigned to this inspection.");
      return;
    }

    const stallId = sched.stallId || sched.stallid || "";
    if (!stallId) {
      alert("Scheduled inspection is missing stallId.");
      return;
    }

    const total = cleanliness + housekeeping + hygiene;
    const pct = (total / 15) * 100;
    const hygieneGrade = gradeFromPercent(pct);

    const annualData = {
      gradeExpiry: gradeExpiryFromTodayMinus1(),
      hygieneGrade: hygieneGrade,
      inspectionDate: todayISO(),
      officerId: myUid,

      remarks: {
        rem_01: remarksText || ""
      },

      scores: {
        cleanliness: cleanliness,
        housekeeping: housekeeping,
        hygiene: hygiene
      },

      stallId: stallId
    };
    await remove(ref(db, schedPath));

    await set(ref(db, annualPath), annualData);

    alert("Submitted! Moved from Pending to Database.");
    window.location.href = "officer_database.html";
  } catch (err) {
    console.error(err);
    alert("Submit failed. Check Console.");
  }
});
