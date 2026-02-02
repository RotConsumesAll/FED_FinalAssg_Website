const stars = document.querySelectorAll('.star');
const ratingInput = document.getElementById('ratingValue');
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
