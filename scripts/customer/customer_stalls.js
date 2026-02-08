import { auth, onAuthStateChanged } from "../firebase/authentication.js";
import { getUserRole } from "../database/meaningful-helpers.js";
import { getAllStalls } from "../database/meaningful-helpers.js";

document.addEventListener("DOMContentLoaded", async () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const uid = user.uid;

      if (await getUserRole(uid) !== "customer") {
        window.location.href = "../../index.html";
      }
        let allStalls = {};
        let recentSearches = [];
        const RECENT_SEARCHES_KEY = 'hawkportal_recent_searches';

        async function loadStalls() {
        try {
            allStalls = await getAllStalls();
            console.log("All stalls loaded:", allStalls);

            loadRecentSearches();
            displayFeaturedStores();
            displayRecentSearches();
            initializeSearch();
            initializeFilters();

        } catch (error) {
            console.error("Error loading stalls:", error);
        }
        }

        function loadRecentSearches() {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
            try {
            recentSearches = JSON.parse(stored);
            } catch (error) {
            console.error("Error recent searches:", error);
            recentSearches = [];
            }
        }
        }

        function saveRecentSearches() {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
        }

        function addToRecentSearches(stallId) {
        recentSearches = recentSearches.filter(id => id !== stallId);
        
        recentSearches.unshift(stallId);
        
        if (recentSearches.length > 6) {
            recentSearches = recentSearches.slice(0, 6);
        }
        
        saveRecentSearches();
        }

        function displayFeaturedStores() {
        const featuredSection = document.querySelector('.stall-section:first-of-type .stall-grid');
        if (!featuredSection) return;
        
        const stallsArray = Object.entries(allStalls).map(([id, data]) => ({
            id,
            ...data
        }));
        
        stallsArray.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
        
        const featuredStalls = stallsArray.slice(0, 4);
    
        featuredSection.innerHTML = '';
        
        featuredStalls.forEach(stall => {
            const card = createStallCard(stall.id, stall);
            featuredSection.appendChild(card);
        });
        }
        
        function displayRecentSearches() {
        const recentSection = document.querySelector('.stall-section:nth-of-type(2) .stall-grid');
        if (!recentSection) return;

        recentSection.innerHTML = '';
        
        if (recentSearches.length === 0) {
            recentSection.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">No recent searches yet. Browse and click on stalls to see them here!</p>';
            return;
        }

        const displayCount = Math.min(recentSearches.length, 4);
        for (let i = 0; i < displayCount; i++) {
            const stallId = recentSearches[i];
            const stall = allStalls[stallId];
            
            if (stall) {
            const card = createStallCard(stallId, stall);
            recentSection.appendChild(card);
            }
        }

        for (let i = displayCount; i < 4; i++) {
            const placeholder = document.createElement('div');
            placeholder.className = 'stall-card';
            placeholder.innerHTML = `
            <div class="stall-overlay">
                <p class="stall-title">Browse stalls</p>
                <p class="stall-rating">-- <img src="../../assets/Icons/star.svg" class="rating-star"></p>
            </div>
            `;
            recentSection.appendChild(placeholder);
        }
        }

        function createStallCard(stallId, stall) {
        const card = document.createElement('div');
        card.className = 'stall-card';
        
        if (stall.image) {
            const img = document.createElement('img');
            img.src = stall.image;
            img.alt = stall.stallName;
            img.onerror = function() {
            this.style.display = 'none';
            };
            card.appendChild(img);
        }
        
        const overlay = document.createElement('div');
        overlay.className = 'stall-overlay';
        overlay.innerHTML = `
            <p class="stall-title">${stall.stallName}</p>
            <p class="stall-rating">${parseFloat(stall.avgRating || 0).toFixed(1)} <img src="../../assets/Icons/star.svg" class="rating-star"></p>
        `;
        
        card.appendChild(overlay);
        
        card.addEventListener('click', () => {
            addToRecentSearches(stallId);
            displayRecentSearches(); 
            window.location.href = `customer_stall_menu.html?id=${stallId}`;
        });
        
        card.style.cursor = 'pointer';
        
        return card;
        }

        function initializeSearch() {
        const searchInput = document.querySelector('.search-bar input[type="text"]');
        const searchBtn = document.querySelector('.search-btn');
        
        if (!searchInput || !searchBtn) return;

        searchBtn.addEventListener('click', performSearch);
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
            performSearch();
            }
        });
        }

        function performSearch() {
        const searchInput = document.querySelector('.search-bar input[type="text"]');
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        const featuredSection = document.querySelector('.stall-section:first-of-type');
        const recentSection = document.querySelector('.stall-section:nth-of-type(2)');
        
        if (!searchTerm) {
            if (featuredSection) featuredSection.style.display = 'block';
            if (recentSection) recentSection.style.display = 'block';
            
            const searchSection = document.querySelector('.search-results-section');
            if (searchSection) searchSection.style.display = 'none';
            
            return;
        }
        
        const filteredStalls = Object.entries(allStalls)
            .filter(([id, stall]) => {
            const nameMatch = stall.stallName.toLowerCase().includes(searchTerm);
            const descMatch = stall.stallDesc && stall.stallDesc.toLowerCase().includes(searchTerm);
            const tagsMatch = stall.tags && stall.tags.some(tag => 
                tag.toLowerCase().includes(searchTerm)
            );
            return nameMatch || descMatch || tagsMatch;
            })
            .map(([id, data]) => ({ id, ...data }));
        
        if (featuredSection) featuredSection.style.display = 'none';
        if (recentSection) recentSection.style.display = 'none';
        
        let searchSection = document.querySelector('.search-results-section');
        if (!searchSection) {
            searchSection = document.createElement('section');
            searchSection.className = 'stall-section search-results-section';
            searchSection.innerHTML = `
            <h2 class="section-title">Search Results</h2>
            <div class="stall-grid"></div>
            `;
            document.querySelector('.page-container').appendChild(searchSection);
        }
        
        const resultsGrid = searchSection.querySelector('.stall-grid');
        resultsGrid.innerHTML = '';
        
        if (filteredStalls.length === 0) {
            resultsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">No stalls found matching your search.</p>';
        } else {
            filteredStalls.forEach(stall => {
            const card = createStallCard(stall.id, stall);
            resultsGrid.appendChild(card);
            });
        }
        
        searchSection.style.display = 'block';
        }

        function initializeFilters() {
        const ratingFilters = document.querySelectorAll('.ratings span');
        
        ratingFilters.forEach(filter => {
            filter.addEventListener('click', function() {
            this.classList.toggle('active');
            
            if (this.classList.contains('active')) {
                this.style.backgroundColor = '#000';
                this.style.color = '#fff';
            } else {
                this.style.backgroundColor = '';
                this.style.color = '';
            }
            });
        });
        
        const applyBtn = document.querySelector('.modal-footer .btn-secondary');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
            applyRatingFilters();
            const modal = bootstrap.Modal.getInstance(document.getElementById('filtersModal'));
            if (modal) modal.hide();
            });
        }
        }

        function applyRatingFilters() {
        const activeRatings = Array.from(document.querySelectorAll('.ratings span.active'))
            .map(span => {
            const ratingText = span.textContent.trim();
            return parseInt(ratingText.charAt(0));
            });
        
        if (activeRatings.length === 0) {
            const featuredSection = document.querySelector('.stall-section:first-of-type');
            const recentSection = document.querySelector('.stall-section:nth-of-type(2)');
            if (featuredSection) featuredSection.style.display = 'block';
            if (recentSection) recentSection.style.display = 'block';
            
            const searchSection = document.querySelector('.search-results-section');
            if (searchSection) searchSection.style.display = 'none';
            const filterSection = document.querySelector('.filter-results-section');
            if (filterSection) filterSection.style.display = 'none';
            
            return;
        }
        
        const filteredStalls = Object.entries(allStalls)
            .filter(([id, stall]) => {
            const rating = parseFloat(stall.avgRating || 0);
            
            return activeRatings.some(filterRating => {
                const minRating = filterRating;
                const maxRating = filterRating + 0.9;
                return rating >= minRating && rating <= maxRating;
            });
            })
            .map(([id, data]) => ({ id, ...data }));
        
        const featuredSection = document.querySelector('.stall-section:first-of-type');
        const recentSection = document.querySelector('.stall-section:nth-of-type(2)');
        if (featuredSection) featuredSection.style.display = 'none';
        if (recentSection) recentSection.style.display = 'none';
        
        const searchSection = document.querySelector('.search-results-section');
        if (searchSection) searchSection.style.display = 'none';
        
        let filterSection = document.querySelector('.filter-results-section');
        if (!filterSection) {
            filterSection = document.createElement('section');
            filterSection.className = 'stall-section filter-results-section';
            filterSection.innerHTML = `
            <h2 class="section-title">Filtered Results</h2>
            <div class="stall-grid"></div>
            `;
            document.querySelector('.page-container').appendChild(filterSection);
        }
        
        const resultsGrid = filterSection.querySelector('.stall-grid');
        resultsGrid.innerHTML = '';
        
        if (filteredStalls.length === 0) {
            resultsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">No stalls found with the selected ratings.</p>';
        } else {
            filteredStalls.forEach(stall => {
            const card = createStallCard(stall.id, stall);
            resultsGrid.appendChild(card);
            });
        }
        
        filterSection.style.display = 'block';
        }

        function initializeLogout() {
        const logoutBtn = document.querySelector('.log-out-button button');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
            console.log("Logout clicked");
            });
        }
        }

        loadStalls();
        initializeLogout();
            
    } else {
      alert("You are signed out. Redirecting to HawkPortal login page.");
      window.location.href = "../../index.html";
    }
  });
});

