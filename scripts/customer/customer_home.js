//DOM
import { getStallMenu } from "../database/meaningful-helpers.js";
import {getStall} from "../database/meaningful-helpers.js";
import { getHawkerCentres } from "../database/meaningful-helpers.js";
import { getAllStalls } from "../database/meaningful-helpers.js";

let stallsFromHawker;
async function asyncGetAllStalls(){
    stallsFromHawker = await getAllStalls();
    console.log(stallsFromHawker);
    //Promo

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
    let arrayNumTimesVis = Object.values(numTimesVisited);
    let i =0;
    while (i!=numTimesVisited.length){
        let currentVisCount = arrayTop3VisitStalls[i];
        let currentNumTimesVisited = arrayNumTimesVis[i];
        currentNumTimesVisited.innerText = currentVisCount.visitCount + " Visits";
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
