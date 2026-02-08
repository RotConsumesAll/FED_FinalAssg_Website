import { auth, onAuthStateChanged } from "../firebase/authentication.js";
import { getUserRole } from "../database/meaningful-helpers.js";
import {
  db,
  ref,
  query,
  orderByChild,
  limitToLast,
  onValue,
  equalTo,
  get,
  push,
} from "../firebase/database.js";
import { getStall } from "../database/meaningful-helpers.js";
import { getHawkerCentres } from "../database/meaningful-helpers.js";
import { fetchData } from "../database/helpers.js";

let stallDetails;
let hawkerCentres;
let feedbacks = [];

document.addEventListener("DOMContentLoaded", async () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const uid = user.uid;

      //   Check role
      if (await getUserRole(uid) !== "customer") {
        window.location.href = "../../index.html";
      }
        async function loadPage(wantedStallId) {
            try {
                stallDetails = await getStall(wantedStallId);
                console.log("details:", stallDetails);
                
                hawkerCentres = await getHawkerCentres();
                console.log("hawkercentres:", hawkerCentres);
                
                const feedbackData = await fetchData(`stalls/${wantedStallId}/feedbacks`);
                if (feedbackData) {
                feedbacks = Object.entries(feedbackData).map(([id, data]) => ({
                    id,
                    ...data
                }));
                }
                console.log("feedbacks:", feedbacks);
                
                loadStallInfo(stallDetails);
                loadHawkerCentreInfo(stallDetails.hawkerCentreId);
                loadReviewsSummary();
                loadReviewCards();
                
            } catch (error) {
                console.error("Error loading page:", error);
            }
        }

        function loadStallInfo(stall) {
            let thumbnailImage = document.querySelector(".stall-thumbnail");
            if (thumbnailImage && stall.image) {
                thumbnailImage.style.backgroundImage = `url("${stall.image}")`;
            }
            
            let stallNameElements = document.querySelectorAll(".stall-name");
            stallNameElements.forEach(element => {
                element.textContent = stall.stallName;
            });
            
            let dirLinks = document.querySelectorAll(".directory-link a");
            dirLinks.forEach(link => {
                if (link.textContent === "StallName") {
                link.textContent = stall.stallName;
                }
            });
            
            let tagsContainer = document.querySelector(".stall-tags-container");
            if (tagsContainer && stall.tags) {
                tagsContainer.innerHTML = "";
                stall.tags.forEach(tag => {
                let tagElement = document.createElement("div");
                tagElement.className = "stall-tag";
                tagElement.innerHTML = `<p class="tag-desc">${tag}</p>`;
                tagsContainer.appendChild(tagElement);
                });
            }
            
            let reviewRating = document.querySelector(".master-stall-reviews .review-rating");
            let reviewQty = document.querySelector(".master-stall-reviews .review-qty");
            
            if (reviewRating && stall.avgRating) {
                reviewRating.textContent = parseFloat(stall.avgRating).toFixed(1);
            }
            
            if (reviewQty && stall.reviewCount) {
                reviewQty.textContent = `${stall.reviewCount} reviews`;
            }
        }

        function loadHawkerCentreInfo(hawkerCentreId) {
            let hawkerCentreData = hawkerCentres[hawkerCentreId];
            
            if (!hawkerCentreData) return;
            
            let stallModal = document.querySelector("#stall-info-modal");
            if (!stallModal) return;
            
            let modalImage = stallModal.querySelector(".modal-info-image");
            let modalTitle = stallModal.querySelector(".item-title");
            let modalTimeRange = stallModal.querySelector(".time-range");
            let modalAddr = stallModal.querySelector(".address");
            
            if (modalImage && hawkerCentreData.image) {
                modalImage.style.backgroundImage = `url("${hawkerCentreData.image}")`;
            }
            
            if (modalTitle) modalTitle.textContent = hawkerCentreData.hcName;
            if (modalTimeRange) {
                modalTimeRange.textContent = `Open ${hawkerCentreData.openingTime} to ${hawkerCentreData.closingTime}`;
            }
            if (modalAddr) modalAddr.textContent = hawkerCentreData.hcAddress;
            }

        function loadReviewsSummary() {
            if (feedbacks.length === 0) {
                console.log("no reviews otsu");
                return;
            }
            
            let ratingCounts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
            let totalRating = 0;
            
            feedbacks.forEach(feedback => {
                let rating = feedback.rating;
                if (rating >= 1 && rating <= 5) {
                ratingCounts[rating]++;
                totalRating += rating;
                }
            });
            
            let avgRating = totalRating / feedbacks.length;
            let totalReviews = feedbacks.length;
            
            let ratingScore = document.querySelector(".rating-score");
            let ratingCount = document.querySelector(".rating-count");
            
            if (ratingScore) {
                ratingScore.innerHTML = `${avgRating.toFixed(1)} <img src="../../assets/Icons/star.svg" class="star">`;
            }
            
            if (ratingCount) {
                ratingCount.textContent = `${totalReviews} reviews`;
            }
            
            let ratingRows = document.querySelectorAll(".rating-row");
            ratingRows.forEach((row, index) => {
                let starRating = 5 - index;
                let count = ratingCounts[starRating];
                let percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                
                let fill = row.querySelector(".fill");
                if (fill) {
                fill.style.width = `${percentage}%`;
                }
            });
        }

        function loadReviewCards(filter = "top") {
            let reviewsContainer = document.querySelector(".reviews-section");
            
            if (!reviewsContainer || feedbacks.length === 0) {
                console.log("why no reviews");
                return;
            }
            
            let existingCards = reviewsContainer.querySelectorAll(".review-card");
            existingCards.forEach(card => card.remove());
            
            let sortedFeedbacks = [...feedbacks];
            
            switch(filter) {
                case "new":
                sortedFeedbacks.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                break;
                case "highest":
                sortedFeedbacks.sort((a, b) => b.rating - a.rating);
                break;
                case "lowest":
                sortedFeedbacks.sort((a, b) => a.rating - b.rating);
                break;
                case "top":
                default:
                sortedFeedbacks.sort((a, b) => {
                    let aHelpful = (a.helpfulVotes || 0) - (a.unhelpfulVotes || 0);
                    let bHelpful = (b.helpfulVotes || 0) - (b.unhelpfulVotes || 0);
                    return bHelpful - aHelpful || b.rating - a.rating;
                });
            }
            
            sortedFeedbacks.forEach(feedback => {
                let reviewCard = createReviewCard(feedback);
                reviewsContainer.appendChild(reviewCard);
            });
            }

            function createReviewCard(feedback) {
            let card = document.createElement("div");
            card.className = "review-card";
            
            let starsHTML = "";
            for (let i = 0; i < 5; i++) {
                starsHTML += `<img src="../../assets/Icons/star.svg" class="star" alt="★">`;
            }
            
            let helpfulVotes = feedback.helpfulVotes || 0;
            let unhelpfulVotes = feedback.unhelpfulVotes || 0;
            
            card.innerHTML = `
                <div class="review-header">
                <p class="review-user">${feedback.userName || "Anonymous"}</p>
                <p class="review-stars">
                    ${starsHTML}
                </p>
                </div>
                <p class="review-text">
                ${feedback.comment || "No comment provided."}
                </p>
                <div class="review-actions">
                <span><img src="../../assets/Icons/thumbs_up.svg"> ${helpfulVotes}</span>
                <span><img src="../../assets/Icons/thumbs_down.svg"> ${unhelpfulVotes}</span>
                </div>
            `;
            
            let stars = card.querySelectorAll(".review-stars .star");
            stars.forEach((star, index) => {
                if (index >= feedback.rating) {
                star.style.opacity = "0.3";
                }
            });
            
            return card;
        }

        function setupFilters() {
            let filterButtons = document.querySelectorAll(".review-filters .filter");
            
            filterButtons.forEach(button => {
                button.addEventListener("click", function() {
                filterButtons.forEach(btn => btn.classList.remove("active"));
                
                this.classList.add("active");
                
                let filterText = this.textContent.toLowerCase();
                let filterType = "top";
                
                if (filterText.includes("new")) filterType = "new";
                else if (filterText.includes("highest")) filterType = "highest";
                else if (filterText.includes("lowest")) filterType = "lowest";
                
                loadReviewCards(filterType);
                });
            });
        }

        function getStallIdFromURL() {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('id');
        }

        const stallId = getStallIdFromURL();
        if (stallId) {
            loadPage(stallId);
            setupFilters();
        } else {
            alert("error: no stall or smth???");
        }
    } else {
      // Not signed in
      alert("You are signed out. Redirecting to HawkPortal login page.");
      window.location.href = "../../index.html";
    }
  });
}); 
