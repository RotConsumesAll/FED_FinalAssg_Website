//DOM
import { getStallMenu } from "../database/meaningful-helpers.js";
import {getStall} from "../database/meaningful-helpers.js";
import { getHawkerCentres } from "../database/meaningful-helpers.js";
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
  runTransaction
} from "../firebase/database.js";

import { auth, onAuthStateChanged } from "../firebase/authentication.js";
import { getUserRole } from "../database/meaningful-helpers.js";


import { checkUserAndGetUid } from "../services/user-authentication-service.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const uid = await checkUserAndGetUid("customer");
    // do whateevr
    let urlParams = new URLSearchParams(window.location.search);
    let wantedStallId = urlParams.get("id");

    let stallMenu;
    let stallDetails;
    let hawkerCentres;
    async function loadPage(wantedStallId){
      //Get data from database
      stallMenu = await getStallMenu(wantedStallId);
      console.log(stallMenu);
      stallDetails = await getStall(wantedStallId);
      console.log(stallDetails);  
      let currentHawkerCentreId = stallDetails.hawkerCentreId;
      hawkerCentres = await getHawkerCentres();
      console.log(hawkerCentres);

      let arrayHawkercentres = [];
      let keyValuePair = Object.entries(hawkerCentres)
      for(let[id, data] of keyValuePair) {
          arrayHawkercentres.push({
              id: id,                  //extracts id
              name: data.hcName,       //extracts name
              address: data.hcAddress, //extracts address
              image: data.image,       //extracts URL
              openingTime: data.openingTime,
              closingTime: data.closingTime
          });
      };
      console.log(arrayHawkercentres);

      //matching hawkercentre id and loading info 
      arrayHawkercentres.forEach(hawker => {
        if (hawker.id===currentHawkerCentreId){
          let stallModel = document.querySelector("#stall-info-modal");           //container
          let stallModalImage = stallModel.querySelector(".modal-info-image");    //image
          let stallModalTitle = stallModel.querySelector(".item-title");          //title
          let stallModalTimeRange = stallModel.querySelector(".time-range");      //time range
          let stallModalAddr = stallModel.querySelector(".address");         //Address

          stallModalImage.style.backgroundImage = `url("${hawker.image}")`;
          stallModalTitle.innerText = hawker.name;
          stallModalTimeRange.innerText ="Open "+ hawker.openingTime + " to " + hawker.closingTime;
          stallModalAddr.innerText = hawker.address;
        }
      }); 

      let modalItemImage = document.querySelectorAll(".modal-item-image"); //Target overlay+cart image
      modalItemImage.forEach(elementItemImage =>{
        elementItemImage.style.backgroundImage = `url("${stallDetails.image}")`;
      });

      let thumbnailImage = document.querySelectorAll(".stall-thumbnail");   //Target stall thumbnail
      thumbnailImage.forEach(elementItemImage =>{
        elementItemImage.style.backgroundImage = `url("${stallDetails.image}")`;
      });

      let stallRating = document.querySelector(".review-rating"); //Stall review rating
      let numOfReviews = document.querySelector(".review-qty");   //Stall number of reviews
      stallRating.innerText = parseFloat(stallDetails.avgRating).toFixed(1);
      numOfReviews.innerText = stallDetails.reviewCount + " reviews";

      let seeReviewsBtn = document.querySelector(".stall-reviews button");
      if (seeReviewsBtn) {
        seeReviewsBtn.addEventListener("click", () => {
          window.location.href = `./customer_stall_reviews.html?id=${wantedStallId}`;
        });
      }

      let stallName = document.querySelector(".stall-name"); //Stall name
      let dirStallName = document.querySelector(".directory-link .dir-stallname-txt"); //Stall name in directory container
      let tagsContainer = document.querySelector(".stall-tags-container");
      tagsContainer.innerHTML = "";
      stallDetails.tags.forEach(tagText => {
        let tagHTML = `
            <div class="stall-tag">
                <p class="tag-desc">${tagText}</p>
            </div>
        `;
        tagsContainer.insertAdjacentHTML("beforeend", tagHTML);
      });

      stallName.textContent=stallDetails.stallName;
      dirStallName.textContent = stallDetails.stallName;

      let cards = document.querySelectorAll(".item-card");
      let arrayStallMenu = Object.entries(stallMenu);
      
      // Check if item has attribute called discountPercent, if yes, remove item from array and add back to start of array
      let promoExists = arrayStallMenu.findIndex(([id,data]) => data.discountPercent !==undefined);
      if (promoExists!=-1){
        let [promoItem] = arrayStallMenu.splice(promoExists,1);
        arrayStallMenu.unshift(promoItem);
        let elementDiscount = document.querySelector(".promotions-container .discount-amt");
        elementDiscount.innerText=promoItem[1].discountPercent + "%";
      }  

      //Loop through all menu cards. cards[0] is always promo card.
      let i=0;
      while (i!=arrayStallMenu.length){
        let currentCard = cards[i];
        let [itemCode,currentMenuItem] = arrayStallMenu[i];

        let itemTitle = currentCard.querySelector(".item-title");
        let itemDesc = currentCard.querySelector(".item-body")      
        let itemCost = currentCard.querySelector(".item-cost");
        let itemImage = currentCard.querySelector(".item-image");

        itemTitle.textContent = currentMenuItem.itemName;
        itemDesc.textContent = currentMenuItem.itemDesc;
        itemCost.textContent = "$"+parseFloat(currentMenuItem.itemPrice).toFixed(2);

        currentCard.addEventListener("click", function(){
          let modal = document.querySelector("#menu-item-modal");
          let modalTitle = modal.querySelector(".item-title");
          let modalDesc = modal.querySelector(".item-body");
          let modalCost = modal.querySelector(".item-cost"); 

          modalTitle.textContent = currentMenuItem.itemName;
          modalDesc.textContent = currentMenuItem.itemDesc;
          modalCost.textContent = "$"+parseFloat(currentMenuItem.itemPrice).toFixed(2);

          let addToCartBtn = document.querySelector("#menu-item-modal .modal-footer .btn");
          addToCartBtn.dataset.itemCode = itemCode;
          addToCartBtn.dataset.stallId = wantedStallId;

          resetModalQty();
        });

        itemImage.style.backgroundImage = `url("${stallDetails.image}")`
        i++;
      }
    }
    loadPage(wantedStallId);


    function resetModalQty(){
      let modalQtyText = document.querySelector("#menu-item-modal .quantity-container .quantity");
      modalQtyText.innerText = "1";
    }


    //+ or - function, used in menu item overlay and cart container.
    function incOrDecQty(userInput){
      let btnClicked = userInput.target.closest("button");    //Get the button element clicked
      let titleOfItem; //Assign later
      let isModal = btnClicked.closest("#menu-item-modal");     
      
      if (!isModal){   //Trigger only if +/- buttons are not in modal
        let itemCardClicked = btnClicked.closest(".item-card"); //Get container element of the specific button clicked
        titleOfItem = itemCardClicked.querySelector(".item-title").innerText; //Get title text in title element
      }
      
      let addQtyBtn = userInput.target.closest(".btn-increase");
      let subQtyBtn = userInput.target.closest(".btn-decrease");  

      if (isModal == null){
        let btnClicked = userInput.target.closest("button");    //Get the button element clicked
        let itemCardClicked = btnClicked.closest(".item-card"); //Get container element of the specific button clicked
        let titleOfItem = itemCardClicked.querySelector(".item-title").innerText; //Get title text in title element
      }

      if (addQtyBtn !== null){
        let qtyContainer = addQtyBtn.closest(".quantity-container");
        let elementQty = qtyContainer.querySelector(".quantity");
        let calcQty = parseInt(elementQty.innerText);
        elementQty.innerText = calcQty + 1;   
        updateCart("add",titleOfItem);
        
      }

      else if (subQtyBtn !== null){
        let qtyContainer = subQtyBtn.closest(".quantity-container");
        let elementQty = qtyContainer.querySelector(".quantity");
        let calcQty = parseInt(elementQty.innerText); 

        //Does not allow qty to be 0 in menu item overlay, 
        if (isModal !== null){
          if (calcQty>1){
            elementQty.innerText = calcQty - 1;
            }
          updateCart("sub",titleOfItem);
        }

        else {
          //If qty reaches 0 in cart container, it is removed from cart.
          if (calcQty===1){
            let closestItemCard = userInput.target.closest(".item-card");
            closestItemCard.remove(); 
            rmvItemFromCartArray(closestItemCard.querySelector(".item-title"));
            updateCart("sub",titleOfItem);                
          }
          else if (calcQty>1){
            elementQty.innerText = calcQty - 1;
            updateCart("sub",titleOfItem);    
          }
        }  
      }
    }


    //Update sub and grand total function
    function updateCost(){
      let elementSubtotal = document.querySelector(".subtotal-amt");
      let elementGrandtotal = document.querySelector(".grandtotal-amt");

      let totalCost = 0;
      cartArray.forEach(item => {
        let elementPrice = item.itemPrice.replace("$","");
        let calcPrice = parseFloat(elementPrice); 
        totalCost += calcPrice*item.quantity;
      });

      if ((elementSubtotal && elementGrandtotal)!==null){
        elementSubtotal.innerText="$" + totalCost.toFixed(2);
        elementGrandtotal.innerText="$" + (totalCost*1.09).toFixed(2);
      }
    }

    //Update cart first to update cost
    function updateCart(choice, wantedNameOfitem){
      let foundItem = cartArray.find(item=>item.itemName === wantedNameOfitem)
      if (foundItem !==null){
        if (choice === "add"){
          foundItem.quantity+=1;
        }

        else if (choice === "sub") {
          //Decrease qty count
          if (foundItem.quantity > 1) {
            foundItem.quantity -= 1;
          } 
          
          //Remove item from array when qty in cart is 0
          else {
            let indexOfItem = cartArray.indexOf(foundItem);
            cartArray.splice(indexOfItem, 1);
          }
        }
        updateCost();
      }
    };



    //Creates a constant itemHTML which will be added to "cart-item-list" container
    function addItemToHTMLCart(itemName, itemPrice, itemImageURL){
      let qtyContainer = document.querySelector("#menu-item-modal .quantity-container"); 
      let modalQuantity = qtyContainer.querySelector(".quantity")
      let currentQty = parseInt(modalQuantity.innerText);
      let itemCode = addToCartBtn.dataset.itemCode;
      let stallId = addToCartBtn.dataset.stallId;
        const itemHTML = `
        <section class="item-card">
          <div class="item-image" style="background-image: url('${itemImageURL}')"></div>
          <div class="item-details">
            <p class="item-title" data-bs-toggle="modal" data-bs-target="#menu-item-modal">
                ${itemName}
            </p>
            <div class="item-cost"> 
              <div class="quantity-container">
                <button class="btn btn-decrease" type="button">-</button>
                <p class="quantity">${currentQty}</p>
                <button class="btn btn-increase" type="button">+</button>
              </div>
              <div class="price-text">${itemPrice}</div>                                       
            </div>            
          </div>        
        </section>
      `;
      cartList.insertAdjacentHTML("beforeend",itemHTML); //Reference: https://www.w3schools.com/jsref/met_node_insertadjacenthtml.asp
      addItemToCartArray(itemName,itemPrice,currentQty,itemCode,stallId);
      updateCost();
    }

    let addToCartBtn = document.querySelector("#menu-item-modal .modal-footer .btn");
    addToCartBtn.addEventListener("click",function(){
      let itemName = document.querySelector("#menu-item-modal .item-title").innerText;
      let itemPrice = document.querySelector("#menu-item-modal .item-cost").innerText;
      let imageStyle = document.querySelector("#menu-item-modal .modal-item-image"); 
      let itemImageURL = window.getComputedStyle(imageStyle).backgroundImage.slice(26,-2).replace("/","../../");  //Live sever view
      addItemToHTMLCart(itemName, itemPrice, itemImageURL);
    });

    //Adding event listeners to containers
    let cartList = document.querySelector(".cart-item-list");
    let modalPage = document.querySelector("#menu-item-modal")
    cartList.addEventListener("click", function(event){
      incOrDecQty(event);
    });
    modalPage.addEventListener("click", function(event){
      incOrDecQty(event);
    });




    //Calculate subtotal in cart
    let cartArray = []
    function addItemToCartArray(itemName,itemPrice,quantity,itemCode,stallId){
      let newCartItem = {
        "itemName":itemName, 
        "itemPrice":itemPrice, 
        "quantity":quantity, 
        "itemCode": itemCode, 
        "stallId": stallId};
      cartArray.push(newCartItem);
    }

    function rmvItemFromCartArray(wantedItemName){
      cartArray.forEach(element => {
        let indexToRemove = cartArray.findIndex(item => element.itemName === wantedItemName)
        if (indexToRemove != -1){
          cartArray.splice(indexToRemove,1);
        }
      });
    }



    //Searchbar
    let searchbar = document.querySelector(".menu-nav .searchbar");
    let menuItems = document.querySelectorAll(".item-card");
    searchbar.addEventListener("input", (e) => {
      let textInput = e.target.value.toLowerCase();
      menuItems.forEach(item => {
        let menuTitle = item.querySelector(".item-title").textContent.toLowerCase();
        if (menuTitle.includes(textInput)){
          item.style.display = "";
        }
        else {
          item.style.display = "none";
        }
      })
    })

    //Checkout button
    let checkoutBtn = document.querySelector(".btn-checkout");
    checkoutBtn.addEventListener("click", function() {
      if (cartArray.length === 0) {
        alert("Your cart is empty.");
      }

      else {
        //create orders object to add to firebase
        let newOrder = {
          orderDate: new Date().toISOString(),
          items:{}
        }
        let uniqueStalls = new Set();
        //add elements to items object
        cartArray.forEach((item,index)=>{
          newOrder.items[index + 1] = {
          stallId: item.stallId,
          itemCode: item.itemCode,
          quantity: item.quantity,
          unitPrice: parseFloat(item.itemPrice.replace("$", ""))
          };
        uniqueStalls.add(item.stallId);
        })

        //send to firebase
        let ordersRef = ref(db, "orders");
        push(ordersRef,newOrder)
          .then (()=>{
            //update visit count
            uniqueStalls.forEach(stallId =>{
              let visitCountRef = ref(db,`stalls/${stallId}/visitCount`);
              runTransaction(visitCountRef, currenVisits => {
                let count = parseInt(currenVisits);
                count++;
                return count.toString();
              })
            .then(() => {
              console.log(`Visit count updated for ${stallId}`);
            })
            .catch((error) => {
              console.error(`Failed to update visit count for ${stallId}:`, error);
              });
            });
            alert("Checkout successful! Thank you for your order.");  
            cartArray = []; //clear cart
            let cartListContainer = document.querySelector(".cart-item-list");
            cartListContainer.innerHTML = ""; //remove item cards
            updateCost();       
          })
          .catch((error) => {
            console.error("Error placing order: ", error);
            alert("Failed to place order. Please try again.");
          });
      }
    });      
  } catch (error) {
    window.location.href = "../../index.html";
    return;
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const uid = user.uid;

      //   Check role
      if (await getUserRole(uid) !== "customer") {
        window.location.href = "../../index.html";
      }

      //   Load page etc. And do whatever you need

      
    } else {
      // Not signed in
      alert("You are signed out. Redirecting to HawkPortal login page.");
      window.location.href = "../../index.html";
    }
  });
});


