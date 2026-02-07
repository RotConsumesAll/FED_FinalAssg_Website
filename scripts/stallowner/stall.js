import { db, ref, onValue, remove, auth, get, update } from "../firebase/index.js";
import { onAuthStateChanged } from 
  "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "signin.html";
    return;
  }

  const uid = user.uid;
  console.log(auth.currentUser);

  const userGet = await get(ref(db, `users/${uid}`));
  if (!userGet.exists()) {
    document.querySelector(".text-menu").textContent = "User profile not found";
    return;
  }

  const { stallId } = userGet.val();
  if (!stallId) {
    document.querySelector(".text-menu").textContent = "No stall assigned";
    return;
  }

  // Gettin the stall data from the database
  const stallRef = ref(db, `stalls/${stallId}`);
  
  onValue(stallRef, (snapshot) => {
    if (!snapshot.exists()) {
      document.querySelector(".text-menu").textContent = "Stall not found";
      return;
    }

    const stallData = snapshot.val();

    document.getElementById("stallName").value = stallData.stallName || "";
    document.getElementById("stallDescription").value = stallData.stallDesc || "";
    document.getElementById("hawkerCentreId").value = stallData.hawkerCentreId || "";
    document.getElementById("UnitNo").value = stallData.stallUnitNo || "";
  });

  // form submission
  const form = document.getElementById("stallForm");
  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Updated values
    const updatedStallData = {
      stallName: document.getElementById("stallName").value.trim(),
      stallDesc: document.getElementById("stallDescription").value.trim(),
      hawkerCentreId: document.getElementById("hawkerCentreId").value.trim(),
      stallUnitNo: document.getElementById("UnitNo").value.trim()
    };
    if (!updatedStallData.stallName || !updatedStallData.stallDesc) {
      alert("Please fill in all required fields!");
      return;
    }

    try {
      await update(ref(db, `stalls/${stallId}`), updatedStallData);
      alert("Stall information updated successfully!");
    } catch (error) {
      console.error("Error updating stall:", error);
      alert("Failed to update stall information. Please try again.");
    }
  });

  console.log(auth.currentUser);
});