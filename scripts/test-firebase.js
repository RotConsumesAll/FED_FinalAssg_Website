// Gemini code
// 1. Initialize Firebase using the variable from config.js
// if (!firebase.apps.length) {
//     firebase.initializeApp(firebaseConfig);
// }
import { ref, set, db } from "./firebase/index.js";

// 2. Define the JSON data you want to test
const testData = {
  "items": [
    {
      "stalls": [
        {
          "Wokhey": [
            { "MenuItem1": 10.50 },
            { "MenuItem2": 12.00 }
          ]
        },
        {
          "YahFu": [
            { "MenuItem1": 8.50 },
            { "MenuItem2": 9.00 }
          ]
        }
      ],
      "Usercart": [
        { "MenuItem1": 10.50 },
        { "MenuItem3": 15.00 }
      ]
    }
  ],
  "testTimestamp": new Date().toISOString() // Helper to see when this was written
};

// 3. The Test Function
function runConnectionTest() {
    console.log("🔵 Starting Firebase Connection Test...");

    // Get a reference to the database service
    // const db = firebase.database();
    // NEW: db already imported from firebase/index.js
    
    // Write to a specific path: '_TestConnection'
    set(ref(db, '_TestConnection'), testData)
    .then(() => {
        console.log("✅ SUCCESS! Connected to Firebase.");
        console.log("🚀 Data was written to the '_TestConnection' node.");
        console.log("Check your Firebase Console to see the data!");
    })
    .catch((error) => {
        console.error("❌ FAILED. Could not connect to Firebase.");
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);
        
        if (error.code === "PERMISSION_DENIED") {
            console.warn("⚠️ Tip: Check your Database Rules in Firebase Console. They might be set to 'read: false, write: false'.");
        }
    });
}

// 4. Run the test
runConnectionTest();