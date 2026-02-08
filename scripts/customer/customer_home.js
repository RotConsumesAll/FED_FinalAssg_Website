//DOM
import { getPromoStalls } from "../database/meaningful-helpers.js";
import { getAllStalls } from "../database/meaningful-helpers.js";






let stallsFromHawker;
let promoStalls;
async function asyncGetAllStalls(){
  stallsFromHawker = await getAllStalls();
  console.log(stallsFromHawker);

  //Promo
  promoStalls = await getPromoStalls();
  let arrayPromoStalls = Object.values(promoStalls);
  console.log(promoStalls);
  let carouselInner = document.querySelector(".carousel-inner");
  let carouselIndicators = document.querySelector(".carousel-indicators");
  carouselInner.innerHTML = "";
  carouselIndicators.innerHTML = "";
  let cardColorPalette = ["#FDC741", "#EB1B2B", "#FFCB70"];
  arrayPromoStalls.forEach((promo,index) => {
    let stallData = stallsFromHawker[promo.stallId];
    let activeClass;
    if (index === 0) {
      activeClass = "active";
    } 
    else {
      activeClass = "";
    }

    let currentColor = cardColorPalette[index%cardColorPalette.length];
    let textColor;
    if (currentColor === "#EB1B2B") {
      textColor = "#FAF9F6"; 
    } else {
      textColor = "#000000";
    }            

    //create indicator dot for carousel html
    let indicatorHTML = `<li data-bs-target="#promocarousel" data-bs-slide-to="${index}" class="${activeClass}"></li>`;
    carouselIndicators.insertAdjacentHTML("beforeend", indicatorHTML);

    //create slide carousel html. Used inline style to match color palette
    let slideHTML = `
            <div class="carousel-item ${activeClass}">
              <div class="container">
                <section>
                    <img class="background-photo" src="${stallData.image}" alt="${stallData.stallName}" style="width: 100%; object-fit: cover;">
                    
                    <div class="bookmark" style="
                        width: 31.875rem;
                        height: 21.875rem;
                        background-color: ${currentColor};
                        position: relative;
                        left: 1.875rem;
                        border-radius: 1%;
                        z-index: 2;
                        display: flex;
                        flex-direction: column;
                    ">
                        <p class="title" style="color: ${textColor}; margin-top: 3.5rem;">${promo.promoTitle}</p> 
                        <p class="body" style="color: ${textColor}; margin-top: 1rem;">${promo.promoDesc}</p>
                        
                        <div class="logo" style="background-image: url('${stallData.image}');"></div> 
                        
                        <div class="triangle-left" style="border-bottom: 16.25rem solid ${currentColor};"></div>
                        <div class="triangle-right" style="border-bottom: 16.25rem solid ${currentColor};"></div>
                        
                        <a href="./customer_stall_menu.html?id=${promo.stallId}" class="btn btn-lg btn-light promo-btn">Order Now!</a>
                    </div>
                </section>
              </div>
            </div>
          `;
    carouselInner.insertAdjacentHTML("beforeend", slideHTML);
  })


  //Freq Visited
  //Sort by top 3 visitCount
  let sortedStallsFromHawker = Object.values(stallsFromHawker);
  sortedStallsFromHawker.sort(function(a,b){return parseInt(b.visitCount)-parseInt(a.visitCount)});
  let arrayTop3VisitStalls = sortedStallsFromHawker.splice(0,3);
  let thirdVisStall =arrayTop3VisitStalls.pop(); 
  arrayTop3VisitStalls.unshift(thirdVisStall);
  console.log(arrayTop3VisitStalls);

  //target podium num visits
  let freqVisited = document.querySelector("#freq-visited");
  let numTimesVisited = freqVisited.querySelectorAll(".num-times-visited"); //Order is 3rd place, 1st place then 2nd place
  let logos = freqVisited.querySelectorAll(".logo");
  let stallName = freqVisited.querySelectorAll(".stallname");
  let arrayNumTimesVis = Object.values(numTimesVisited);
  let i =0;
  while (i!=numTimesVisited.length){
      let currentVisCount = arrayTop3VisitStalls[i];
      let currentNumTimesVisited = arrayNumTimesVis[i];
      let currentlogo = logos[i];
      let currentStallname = stallName[i]
      currentNumTimesVisited.innerText = currentVisCount.visitCount + " Visits";
      currentlogo.style.backgroundImage = `url("${currentVisCount.image}")`;
      currentStallname.textContent = currentVisCount.stallName; 
      console.log(currentlogo);
      i++;
  }


  //Discover More
  //Select 6 random stalls
  let allStallKeys = Object.keys(stallsFromHawker);
  let tempChosen6Stalls = {};
  for(let i =0; i<6;i++ ){
      let randomIndex = Math.floor(Math.random() * allStallKeys.length);        
      let [selectedKey] = allStallKeys.splice(randomIndex, 1);
      tempChosen6Stalls[selectedKey] = stallsFromHawker[selectedKey];
  }
  console.log(tempChosen6Stalls);
  stallsFromHawker = tempChosen6Stalls;
  console.log(stallsFromHawker);

  //target recommendations
  let chosen6Stalls = Object.entries(stallsFromHawker);
  let arrayRecommendations = document.querySelectorAll(".recommendation");
  arrayRecommendations.forEach((elementRec, index) => {
      let [stallId,stallData] = chosen6Stalls[index];

      let recImage = elementRec.querySelector(".preview-photo");
      let recStallName = elementRec.querySelector(".stallname");
      console.log(stallData.image);

      recImage.style.backgroundImage = `url("${stallData.image}")`;
      recStallName.innerText = stallData.stallName;

      console.log(stallData.stallName);

      elementRec.addEventListener("click",function(){
          window.location.href = `./customer_stall_menu.html?id=${stallId}`;          
      })
  });
}
asyncGetAllStalls();