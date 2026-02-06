import { db, ref, push, auth, get } from "../firebase/index.js";

// searching stalls

let stalls = [];

async function loadStalls() {
  try {
    const snapshot = await get(ref(db, "stalls"));
    if (snapshot.exists()) {
      const data = snapshot.val();
      // convert to array of { stallId, stallName } yay
      stalls = Object.entries(data).map(([stallId, info]) => ({
        stallId,
        stallName: info.stallName,
      }));
    }
  } catch (err) {
    console.error("Error loading stalls:", err);
  }
}

// call this on page load
loadStalls();

const input = document.getElementById("EnterFoodStall");
const suggestionBox = document.getElementById("stallSuggestions");

let selectedStallId = null;

input.addEventListener("input", () => {
  const query = input.value.toLowerCase();
  suggestionBox.innerHTML = "";

  if (!query) return;

  const matches = stalls.filter(stall =>
    stall.stallName.toLowerCase().includes(query) // show suggestions yes
  );

  matches.forEach(stall => {
    const li = document.createElement("li");
    li.className = "list-group-item list-group-item-action";
    li.textContent = stall.stallName;

    li.addEventListener("click", () => {
      input.value = stall.stallName;
      selectedStallId = stall.stallId; 
      suggestionBox.innerHTML = "";
    });

    suggestionBox.appendChild(li);
  });
});

// star rating system

const stars = document.querySelectorAll('.star');
const ratingInput = document.getElementById('rating');
let currentRating = 0;

stars.forEach(star => {
  const value = Number(star.dataset.value);

  // Hover preview
  star.addEventListener('mouseenter', () => {
    fillStars(value);
  });

  // Click to set rating
  star.addEventListener('click', () => {
    currentRating = value;
    ratingInput.value = value; // for form submission
    fillStars(currentRating);
  });
});

// When mouse leaves the whole star area
document.querySelector('.frame-2').addEventListener('mouseleave', () => {
  fillStars(currentRating);
});

function fillStars(rating) {
  stars.forEach(star => {
    const starValue = Number(star.dataset.value);
    star.classList.toggle('filled', starValue <= rating);
  });
}

// receving feedback form submission

import { getAuth, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getObjectsByAttribute } from "../database/helpers.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Logged in user:", user.displayName, user.email);
  } else {
    console.log("No user logged in");
    window.location.href = "./index.html";
  }
});

const form = document.getElementById("feedbackForm");

form.addEventListener("submit", (e) => {
  e.preventDefault(); // stops page reload

  const user = auth.currentUser;
  const rating = document.getElementById("rating").value;
  const comment = document.getElementById("comment").value;
  const stallName = document.getElementById("EnterFoodStall").value;
  

  if (!stallName) return alert("Please select a stall.");
  if (!selectedStallId) {
  const stall = stalls.find(s => s.stallName.toLowerCase() === stallName.toLowerCase());
  if (!stall) return alert("Stall not found. Please select from the suggestions.");
  selectedStallId = stall.stallId;
}
  if (!rating) return alert("Please rate your experience.");
  if (!comment) return alert("Please write a comment.");
  onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Please sign in first");
    return;
  }
});


  const feedbackRef = ref(db, `stalls/${selectedStallId}/feedbacks`);

  push(feedbackRef, {
    stallName,
    rating: Number(rating),
    comment,
    userName: user.displayName ?? "Anonymous",
    createdAt: Date.now(), // optional I guess but good to have
  })
    .then(() => {
      alert("Feedback submitted!");
      form.reset();
      currentRating = 0;
      fillStars(currentRating);
    })
    .catch((error) => {
      console.error(error);
      alert("Something went wrong");
    });
});
