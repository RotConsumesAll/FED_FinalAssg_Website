import { db, ref, push, auth, get } from "../firebase/index.js";
import { onAuthStateChanged } from 
  "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../../index.html";
    return;
  }

  // Gettin category from localStorage 
  const category = localStorage.getItem("selectedCategory");
  
  const submitBtn = document.querySelector(".button-shape-2");
  
  submitBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    
    const itemName = document.getElementById("ItemName").value.trim();
    const itemPrice = document.getElementById("ItemPrice").value;
    
    if (!itemName || !itemPrice) {
      alert("Please fill in both fields");
      return;
    }
    
    try {
      const uid = user.uid;
      const userSnapshot = await get(ref(db, `users/${uid}`));
      const { stallId } = userSnapshot.val();
      
      await push(ref(db, `menuItems/${stallId}`), {
        itemName: itemName,
        itemPrice: parseFloat(itemPrice),
        itemCategory: category
      });
      
      alert("Item added!");
      localStorage.removeItem("selectedCategory"); // Clean up
      window.location.href = "stallowner_menu.html";
      
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add item");
    }
  });
});