import { db, ref, onValue, remove, auth, get } from "../firebase/index.js";
import { onAuthStateChanged } from 
  "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "signin.html";
    return;
  }
const menuContainer = document.getElementById("menuContainer");
  const uid = user.uid;
  console.log(auth.currentUser);

  const userGet = await get(ref(db, `users/${uid}`));
  if (!userGet.exists()) {
    menuContainer.textContent = "User profile not found";
    return;
  }

  const { stallId } = userGet.val();
  if (!stallId) {
    menuContainer.textContent = "No stall assigned";
    return;
  }

async function loadMenu() {
  try {
    const snapshot = await get(ref(db, `menuItems/${stallId}`));

    if (!snapshot.exists()) {
      menuContainer.innerHTML = '<h1 class="text-menu">No menu items found.</h1>';
      return;
    }

    const items = snapshot.val();

    // grouping items by category
    const categories = {};

    Object.values(items).forEach(item => {
      const category = item.itemCategory || "Others";
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(item);
    });

    // loadingggggg categoriesssss (and items)
    menuContainer.innerHTML = "";

    Object.entries(categories).forEach(([categoryName, categoryItems]) => {
      // Category headers
      const headerSection = document.createElement("section");
      headerSection.className = "frame-7";
      headerSection.innerHTML = `
        <h2 class="text-signatures">${categoryName}</h2>
        <a href="./stallowner_edititem.html" class="edit-button">Edit</a>
      `;

      // Items container
      const itemsSection = document.createElement("section");
      itemsSection.className = "frame-3";

      categoryItems.forEach(item => {
        const itemCard = document.createElement("section");
        itemCard.className = "rectangle-5";

        itemCard.innerHTML = `
        <svg class="img-vector" viewBox="0 0 70.5 70.5">
            <path d="M 2.9375 0 C 2.158426532521844 0 1.4112624889239669 0.30948629323393106 0.860374391078949 0.860374391078949 C 0.30948629323393106 1.4112624889239669 1.304512053934559e-15 2.158426532521844 0 2.9375 L 0 67.5625 C 0 68.34157346747816 0.30948629323393106 69.08874031249434 0.860374391078949 69.63962841033936 C 1.4112624889239669 70.19051650818437 2.158426532521844 70.5 2.9375 70.5 L 67.5625 70.5 C 68.34157346747816 70.5 69.08874031249434 70.19051650818437 69.63962841033936 69.63962841033936 C 70.19051650818437 69.08874031249434 70.5 68.34157346747816 70.5 67.5625 L 70.5 2.9375 C 70.5 2.158426532521844 70.19051650818437 1.4112624889239669 69.63962841033936 0.860374391078949 C 69.08874031249434 0.30948629323393106 68.34157346747816 1.304512053934559e-15 67.5625 0 L 2.9375 0 Z M 37.329750537872314 57.892250537872314 L 64.625 30.591123700141907 L 64.625 64.625 L 5.875 64.625 L 5.875 54.09112370014191 L 17.625 42.34112370014191 L 33.170249462127686 57.892250537872314 C 33.443117825780064 58.16580958245322 33.767274315003306 58.38284680643119 34.12415200471878 58.53093469142914 C 34.481029694434255 58.67902257642709 34.86361713800579 58.75524985790253 35.25 58.75524985790253 C 35.63638286199421 58.75524985790253 36.01896750414744 58.67902257642709 36.375845193862915 58.53093469142914 C 36.73272288357839 58.38284680643119 37.056882174219936 58.16580958245322 37.329750537872314 57.892250537872314 Z M 17.625 11.691250056028366 C 16.066853065043688 11.691250056028368 14.572524977847934 12.310221241787076 13.470748782157898 13.411997437477112 C 12.368972586467862 14.513773633167148 11.750000000000002 16.0081017203629 11.75 17.566248655319214 C 11.750000000000002 19.124395590275526 12.368972586467862 20.618726478889585 13.470748782157898 21.72050267457962 C 14.572524977847934 22.822278870269656 16.066853065043688 23.441248655319214 17.625 23.441248655319214 C 19.183146934956312 23.441248655319214 20.677475022152066 22.822278870269656 21.779251217842102 21.72050267457962 C 22.881027413532138 20.618726478889585 23.5 19.124395590275526 23.5 17.566248655319214 C 23.5 16.0081017203629 22.881027413532138 14.513773633167148 21.779251217842102 13.411997437477112 C 20.677475022152066 12.310221241787076 19.183146934956312 11.691250056028371 17.625 11.691250056028366 Z"fill="currentColor" />
        </svg>
        <p class="menu-header">${item.itemName}</p>
          <span class="menu-item-price">$${Number(item.itemPrice).toFixed(2)}</span>
        `;

        itemsSection.appendChild(itemCard);
      });

      menuContainer.appendChild(headerSection);
      menuContainer.appendChild(itemsSection);
    });

  } catch (error) {
    console.error("Error loading menu:", error);
  }
}

loadMenu();

})