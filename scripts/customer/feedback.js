
// searching stalls

const stalls = [
  "Ah Seng Chicken Rice",
  "Siti Nasi Lemak",
  "Bombay Biryani",
  "Dragon Wok",
  "Tokyo Ramen",
  "Korean BBQ Express",
  "Western Grill",
  "Thai Basil",
  "Veg Delight",
  "Uncle Lim Fish Soup",
  "BBQ King",
  "Dessert Corner",
  "Teh Tarik House",
  "Seafood Wok",
  "Noodle Bar"
];

const input = document.getElementById("EnterFoodStall");
const suggestionBox = document.getElementById("stallSuggestions");

input.addEventListener("input", () => {
  const query = input.value.toLowerCase();
  suggestionBox.innerHTML = "";

  if (!query) return;

  const matches = stalls.filter(stall =>
    stall.toLowerCase().includes(query)
  );

  matches.forEach(stall => {
    const li = document.createElement("li");
    li.className = "list-group-item list-group-item-action";
    li.textContent = stall;

    li.addEventListener("click", () => {
      input.value = stall;
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

import { db, ref, push } from "../firebase/index.js";

const form = document.getElementById("feedbackForm");

form.addEventListener("submit", (e) => {
  e.preventDefault(); // stops page reload

  // const email = document.getElementById("email").value;
  const rating = document.getElementById("rating").value;
  const comment = document.getElementById("comment").value;
  const stallName = document.getElementById("EnterFoodStall").value;

  if (!stallName) return alert("Please select a stall.");
  if (!rating) return alert("Please rate your experience.");
  if (!comment) return alert("Please write a comment.");

  const feedbackRef = ref(db, "feedbacks");

  push(feedbackRef, {
    // email, // to get the name of user, needs implementation of auth branch first, hence *WIP*
    stallName,
    rating: Number(rating),
    comment,
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
