//DOM
import { getStallMenu } from "../database/meaningful-helpers.js";

async function asyncGetStallMenu(wantedStallId){
  let stallMenu = await getStallMenu(wantedStallId);
  console.log(stallMenu);
}

asyncGetStallMenu("stall_01");


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
    if (isModal !==null){
      updateCart("add",titleOfItem);
    }
  }

  else if (subQtyBtn !== null){
    let qtyContainer = subQtyBtn.closest(".quantity-container");
    let elementQty = qtyContainer.querySelector(".quantity");
    let calcQty = parseInt(elementQty.innerText); 
    // let isModal = subQtyBtn.closest("#menu-item-modal");  

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
    elementGrandtotal.innerText="$" + (totalCost*1.07).toFixed(2);
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
          <div class="price-text">$${itemPrice}</div>                                       
        </div>            
      </div>        
    </section>
  `;
  cartList.insertAdjacentHTML("beforeend",itemHTML); //Reference: https://www.w3schools.com/jsref/met_node_insertadjacenthtml.asp
  addItemToCartArray(itemName,itemPrice,currentQty);
  updateCost();
}


let addToCartBtn = document.querySelector("#menu-item-modal .modal-footer .btn");
addToCartBtn.addEventListener("click",function(){
  let itemName = document.querySelector("#menu-item-modal .item-title").innerText;
  let itemPrice = document.querySelector("#menu-item-modal .item-cost").innerText;
  let imageStyle = document.querySelector("#menu-item-modal .modal-item-image"); 
  let itemImageURL = window.getComputedStyle(imageStyle).backgroundImage.slice(26,-2).replace("/","../");  
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
function addItemToCartArray(itemName,itemPrice,quantity){
  let newCartItem = {"itemName":itemName, "itemPrice":itemPrice, "quantity":quantity};
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


