import { db, ref, onValue, get, auth, update } from "../firebase/index.js";
import { onAuthStateChanged } from 
  "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../../index.html";
    return;
  }

  const uid = user.uid;
  console.log("Current user:", auth.currentUser);

  const userGet = await get(ref(db, `users/${uid}`));
  if (!userGet.exists()) {
    console.error("User profile not found");
    return;
  }

  const { stallId } = userGet.val();
  if (!stallId) {
    console.error("No stall assigned");
    return;
  }

  // Listening to orders in real time
  const ordersRef = ref(db, "orders");
  onValue(ordersRef, async (snapshot) => {
    if (!snapshot.exists()) {
      clearAllOrders();
      return;
    }

    const allOrders = snapshot.val();
    const filteredOrders = await filterAndProcessOrders(allOrders, stallId);
    displayOrders(filteredOrders);
  });
});

// Filter orders that contain items from this stall (thru stallId)
async function filterAndProcessOrders(allOrders, stallId) {
  const processedOrders = [];

  for (const [customerUid, orderData] of Object.entries(allOrders)) {
    const { items, orderDate, status = "in-progress" } = orderData;
    
    if (!items) continue;

    // get Items that belong to this stall
    const stallItems = [];
    for (const [itemKey, itemData] of Object.entries(items)) {
      if (itemData.stallId === stallId) {
        // gettin item details from menuItems
        const itemDetails = await getItemDetails(stallId, itemData.itemCode);
        stallItems.push({
          ...itemData,
          name: itemDetails?.itemName || "Unknown Item",
          unitPrice: itemData.unitPrice || itemDetails?.unitPrice || 0
        });
      }
    }
    if (stallItems.length > 0) {
      const totalPrice = stallItems.reduce((sum, item) => 
        sum + (item.unitPrice * item.quantity), 0
      );

      processedOrders.push({
        customerUid,
        orderDate: new Date(orderDate),
        status: status || "in-progress",
        items: stallItems,
        totalItems: stallItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: totalPrice.toFixed(2)
      });
    }
  }

  return processedOrders;
}

const itemDetailsCache = {};
async function getItemDetails(stallId, itemCode) {
  const cacheKey = `${stallId}-${itemCode}`;
  if (itemDetailsCache[cacheKey]) {
    return itemDetailsCache[cacheKey];
  }

  try {
    const snapshot = await get(ref(db, `menuItems/${stallId}/${itemCode}`));
    if (snapshot.exists()) {
      itemDetailsCache[cacheKey] = snapshot.val();
      return snapshot.val();
    }
  } catch (error) {
    console.error("Error fetching item details:", error);
  }
  return null;
}

// Display orders in the UI
function displayOrders(orders) {
  const inProgressOrders = orders.filter(o => o.status === "in-progress");
  const completedOrders = orders.filter(o => o.status === "completed");
  const cancelledOrders = orders.filter(o => o.status === "cancelled");

  clearAllOrders();

  // display in-progress orders
  const inProgressContainer = document.querySelector(".in-progress .rectangle-2");
  const inKitchenHeader = inProgressContainer.querySelector(".section-header");
  
  inProgressOrders.forEach(order => {
    const orderElement = createOrderElement(order, "in-progress");
    inKitchenHeader.insertAdjacentElement("afterend", orderElement);
  });

  // display completed orders
  const completedContainer = document.querySelector(".completed .rectangle-2");
  
  completedOrders.slice(0, 10).forEach(order => {
    const orderElement = createOrderElement(order, "completed");
    completedContainer.appendChild(orderElement);
  });

  // display cancelled orders
  const cancelledContainer = document.querySelector(".cancelled-refunded .rectangle-2");
  
  cancelledOrders.slice(0, 10).forEach(order => {
    const orderElement = createOrderElement(order, "cancelled");
    cancelledContainer.appendChild(orderElement);
  });
}

// Create order HTML element
function createOrderElement(order, section) {
  const orderSection = document.createElement("section");
  orderSection.className = "orders";

  const itemsList = order.items.map(item => 
    `${item.name} x${item.quantity}`
  ).join(", ");

  const timeLabel = section === "completed" ? "Completed time" : 
                    section === "cancelled" ? "Cancelled time" : 
                    "Estimated time";
  
  const timeValue = section === "in-progress" ? 
    `${Math.ceil(Math.random() * 15 + 5)} min` : 
    formatOrderTime(order.orderDate);

  orderSection.innerHTML = `
    <div class="rectangle-3" style="cursor: pointer;">
      <p class="order-title">${itemsList}</p>
      <span class="order-items">${order.totalItems} item${order.totalItems > 1 ? 's' : ''}</span>
      <span class="order-time-label">${timeLabel}</span>
      <span class="order-time">${timeValue}</span>
      <span class="order-type">Takeaway</span>
      <span class="order-price">$${order.totalPrice}</span>
      <div class="rectangle-4"></div>
      <div class="vector-wrapper" aria-hidden="true">
        <img class="vector-2" src="../../assets/Icons/takeaway.svg" alt="" />
      </div>
    </div>
  `;

  // Add click handler only for in-progress orders
  if (section === "in-progress") {
    const rectangle = orderSection.querySelector(".rectangle-3");
    rectangle.addEventListener("click", () => {
      showOrderStatusModal(order);
    });
  }

  return orderSection;
}

// Show modal to update order status
function showOrderStatusModal(order) {
  // Create modal overlay
  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;

  // Create modal content
  const modalContent = document.createElement("div");
  modalContent.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 12px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    font-family: 'Inter';
  `;

  const itemsList = order.items.map(item => 
    `${item.name} x${item.quantity}`
  ).join(", ");

  modalContent.innerHTML = `
    <h2 style="font-family: 'Inter'; margin: 0 0 10px 0; font-size: 20px; font-weight: 600;">Update Order Status</h2>
    <p style="font-family: 'Inter'; margin: 0 0 20px 0; color: #666; font-size: 14px;">${itemsList}</p>
    <p style="font-family: 'Inter'; margin: 0 0 20px 0; font-weight: 500;">Total: $${order.totalPrice}</p>
    <div style="display: flex; gap: 10px; flex-direction: column;">
      <button id="completeBtn" style="
        padding: 12px 20px;
        background: #22c55e;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
      ">Mark as Completed</button>
      <button id="cancelBtn" style="
        padding: 12px 20px;
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
      ">Cancel Order</button>
      <button id="closeBtn" style="
        padding: 12px 20px;
        background: #e5e7eb;
        color: #374151;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
      ">Close</button>
    </div>
  `;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Add hover effects
  const completeBtn = modalContent.querySelector("#completeBtn");
  const cancelBtn = modalContent.querySelector("#cancelBtn");
  const closeBtn = modalContent.querySelector("#closeBtn");

  completeBtn.addEventListener("mouseenter", () => {
    completeBtn.style.background = "#16a34a";
  });
  completeBtn.addEventListener("mouseleave", () => {
    completeBtn.style.background = "#22c55e";
  });

  cancelBtn.addEventListener("mouseenter", () => {
    cancelBtn.style.background = "#dc2626";
  });
  cancelBtn.addEventListener("mouseleave", () => {
    cancelBtn.style.background = "#ef4444";
  });

  closeBtn.addEventListener("mouseenter", () => {
    closeBtn.style.background = "#d1d5db";
  });
  closeBtn.addEventListener("mouseleave", () => {
    closeBtn.style.background = "#e5e7eb";
  });

  completeBtn.addEventListener("click", async () => {
    await updateOrderStatus(order.customerUid, "completed");
    document.body.removeChild(modal);
  });

  cancelBtn.addEventListener("click", async () => {
    await updateOrderStatus(order.customerUid, "cancelled");
    document.body.removeChild(modal);
  });

  closeBtn.addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

// Updating order status in Firebase
async function updateOrderStatus(customerUid, newStatus) {
  try {
    const orderRef = ref(db, `orders/${customerUid}`);
    await update(orderRef, {
      status: newStatus
    });
    console.log(`Order updated to ${newStatus}`);
  } catch (error) {
    console.error("Error updating order status:", error);
    alert("Failed to update order status. Please try again.");
  }
}

function formatOrderTime(date) {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  }).toLowerCase();

  if (isToday) return `Today, ${timeStr}`;
  if (isYesterday) return `Yesterday, ${timeStr}`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + `, ${timeStr}`;
}

function clearAllOrders() {
  const sections = document.querySelectorAll(".orders");
  sections.forEach(section => section.remove());
}