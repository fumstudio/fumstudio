  
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getDatabase, ref as dbRef, get, onValue } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyBDrzrgLslaJvnXbo1e90irCEtdcm9ZsCU",
    authDomain: "logins-13661.firebaseapp.com",
    databaseURL: "https://logins-13661-default-rtdb.firebaseio.com",
    projectId: "logins-13661",
    storageBucket: "logins-13661.appspot.com",
    messagingSenderId: "451535349483",
    appId: "1:451535349483:web:d3c9867fd2bffbbdca40ae",
    measurementId: "G-DWP16WX2H7"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Function to load the cart from Firebase
async function loadCart(userId) {
    try {
        const cartRef = dbRef(db, 'carts/' + userId);
        const snapshot = await get(cartRef);

        if (snapshot.exists() && snapshot.val() && Array.isArray(snapshot.val().cart)) {
            const cartItems = snapshot.val().cart;
            cartItems.forEach(item => {
                if (item.quantity === undefined || item.quantity === null) {
                    item.quantity = 1;  // Set default quantity if not defined
                }
            });
            updateTotalItemCount(cartItems);
        } else {
            const itemCountElement = document.getElementById('totalItemCount');
            if (itemCountElement) {
                itemCountElement.innerText = '0';  // If no items in the cart
            }
        }
    } catch (error) {
        const itemCountElement = document.getElementById('totalItemCount');
        if (itemCountElement) {
            itemCountElement.innerText = '0';  // If error occurs
        }
        console.error("Error loading cart:", error);
    }
}

// Function to calculate the total number of items in the cart
function getTotalItemCount(cartItems) {
    return cartItems.reduce((total, item) => {
        return total + (item.quantity || 1);  // Default to 1 if quantity is undefined
    }, 0);
}

// Function to update the total item count in the cart
function updateTotalItemCount(cartItems) {
    const totalItemCount = getTotalItemCount(cartItems);
    const itemCountElement = document.getElementById('totalItemCount');
    if (itemCountElement) {
        itemCountElement.innerText = totalItemCount;
    } 
}

// Listen for changes in the cart data and update the total count in real-time
function listenToCartChanges(userId) {
    const cartRef = dbRef(db, 'carts/' + userId);
    onValue(cartRef, (snapshot) => {
        if (snapshot.exists() && snapshot.val() && Array.isArray(snapshot.val().cart)) {
            const cartItems = snapshot.val().cart;
            cartItems.forEach(item => {
                if (item.quantity === undefined || item.quantity === null) {
                    item.quantity = 1;  // Ensure quantity is set to 1 if undefined
                }
            });
            updateTotalItemCount(cartItems);
        } else {
            const itemCountElement = document.getElementById('totalItemCount');
            if (itemCountElement) {
                itemCountElement.innerText = '0';  // No items in the cart
            }
        }
    });
}

// Initialize Firebase authentication and listen for authentication state changes
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        const itemCountElement = document.getElementById('totalItemCount');
        
        if (user) {
            loadCart(user.uid);  // Load the cart if the user is logged in
            listenToCartChanges(user.uid);  // Set up real-time listener for cart updates
        } else {
            if (itemCountElement) {
                itemCountElement.innerText = '0';  // User not logged in
            }
        }
    });
});
