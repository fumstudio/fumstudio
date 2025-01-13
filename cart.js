import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getDatabase, ref as dbRef, get, update } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";

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
const storage = getStorage(app);

let paymentsData = {}; // Global variable for payments data
let archivedCarts = {}; // Global variable for archived carts data

// Function to load payments and fetch status from archivedCarts
async function loadPayments(userId) {
    const paymentsRef = dbRef(db, `payments/${userId}`);
    const archivedCartsRef = dbRef(db, `archivedCarts/${userId}`); // Reference to archivedCarts
    const paymentsSnapshot = await get(paymentsRef);
    const archivedCartsSnapshot = await get(archivedCartsRef);

    if (archivedCartsSnapshot.exists()) {
        archivedCarts = archivedCartsSnapshot.val(); // Get the archived carts data
    }

    if (paymentsSnapshot.exists()) {
        paymentsData = paymentsSnapshot.val(); // Store the payments data
        displayPayments(paymentsData); // Pass payments data
    } else {
        document.getElementById('paymentsContainer').innerHTML = 'No payment data found.';
    }
}

// Function to format profile object
function formatProfile(profile) {
    if (!profile || !profile.addresses) return 'No profile data';

    const address = profile.addresses.address1;
    return `
        <p><strong>Email:</strong> ${profile.email}</p>
        <div class="address-details">
            <p><strong>Street:</strong> ${address.street}</p>
            <p><strong>Complex:</strong> ${address.complex}</p>
            <p><strong>City:</strong> ${address.city}</p>
            <p><strong>Province:</strong> ${address.province}</p>
            <p><strong>Postal Code:</strong> ${address.postalCode}</p>
            <p><strong>Country:</strong> ${address.country}</p>
            <p><strong>Phone:</strong> ${address.phone}</p>
            <p><strong>Last Changed:</strong> ${address.lastChangedDate}</p>
        </div>
        <p><strong>Address Changed:</strong> ${address.addressChanged}</p>
    `;
}

function formatData(data, level = 0) {
    let formattedData = '';
    const indent = ' '.repeat(level * 4); // Indentation based on the depth level
    if (typeof data === 'object' && data !== null) {
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                if (typeof data[key] === 'object') {
                    formattedData += `${indent}${key}:\n${formatData(data[key], level + 1)}`;
                } else {
                    formattedData += `${indent}${key}: ${data[key]}\n`;
                }
            }
        }
    } else {
        formattedData = `${indent}${data}\n`;
    }
    return formattedData;
}

// Function to display payments sorted by timestamp in descending order
function displayPayments(paymentsData) {
    const paymentsContainer = document.getElementById('paymentsContainer');
    paymentsContainer.innerHTML = '';  // Clear the container

    // Sort payments by timestamp in descending order
    const sortedPayments = Object.keys(paymentsData).sort((a, b) => {
        const timestampA = new Date(paymentsData[a].timestamp);
        const timestampB = new Date(paymentsData[b].timestamp);
        return timestampB - timestampA; // Sort descending by date
    });

    sortedPayments.forEach(cartId => {
        const payment = paymentsData[cartId];
        const paymentDiv = document.createElement('div');
        paymentDiv.classList.add('payment-item');
        paymentDiv.setAttribute('data-cart-id', cartId);

        // Fetch the status from archivedCarts if available
        const statusText = archivedCarts[cartId] ? archivedCarts[cartId].status : payment.status; // Use archivedCarts status if available

        let imageContent = '';
        let imageStatusText = 'No image uploaded';
        if (payment.imageUrl) {
            imageContent = `<img src="${payment.imageUrl}" alt="Uploaded Image" class="image-thumbnail" />`;
            imageStatusText = payment.imageStatus || 'Uploaded';
        }

        paymentDiv.innerHTML = `
            <h3 class="payment-title">Cart ID: ${cartId}</h3>
            <p class="status-display">Status: ${statusText}</p> <!-- Show status from archivedCarts or payments -->
            <p>Timestamp: ${new Date(payment.timestamp).toLocaleString()}</p> <!-- Display timestamp in a readable format -->
            <h4>Profile</h4>
            ${formatProfile(payment.profile)}
            <button class="update-button" data-cart-id="${cartId}" data-status="${payment.status}">Toggle Status</button>
            <div class="drop-zone" data-cart-id="${cartId}">
                ${imageContent ? `<a href="${payment.imageUrl}" target="_blank">${imageContent}</a>` : '<i class="fas fa-image icon"></i>'}
            </div>
            <input type="file" class="file-input" data-cart-id="${cartId}" accept="image/*" style="display:none;" />
            <button class="change-image-button" data-cart-id="${cartId}" style="display: ${payment.imageUrl ? 'block' : 'none'};">Change Image</button>
            <p class="image-status" id="status-${cartId}">${imageStatusText}</p>
            <button class="toggle-button" id="toggleResponse-${cartId}">Toggle Response</button>
            <pre class="payment-response" id="response-${cartId}" style="display: none;">${formatData(payment.response)}</pre>
        `;

        paymentsContainer.appendChild(paymentDiv);
    });

    // Attach event listeners for search input fields
    document.getElementById('paymentsContainer').addEventListener('click', function (event) {
        // Toggle the visibility of the payment response when "Toggle Response" button is clicked
        if (event.target.classList.contains('toggle-button')) {
            const cartId = event.target.id.split('-')[1];  // Extract cartId from button ID
            const responseElement = document.getElementById(`response-${cartId}`);

            // Toggle the visibility of the payment response
            if (responseElement.style.display === 'none') {
                responseElement.style.display = 'block';  // Show the response
            } else {
                responseElement.style.display = 'none';  // Hide the response
            }
        }

        // Handle update status button clicks
        if (event.target.classList.contains('update-button')) {
            updatePaymentStatus(event);
        }
    });
}

// Function to search cart data based on user input
function searchCartData() {
    const emailSearch = document.getElementById('searchEmail').value.toLowerCase();
    const statusSearch = document.getElementById('searchStatus').value.toLowerCase();
    const timestampSearch = document.getElementById('searchTimestamp').value.toLowerCase();
    const cartIdSearch = document.getElementById('searchCartId').value.toLowerCase();

    const filteredPayments = Object.keys(paymentsData).filter(cartId => {
        const payment = paymentsData[cartId];

        // Get the status from archivedCarts (if available)
        const archivedCartStatus = archivedCarts[cartId] ? archivedCarts[cartId].status : payment.status;

        const emailMatch = payment.profile?.email?.toLowerCase().includes(emailSearch);
        const statusMatch = archivedCartStatus?.toLowerCase().includes(statusSearch); // Match status from archivedCarts
        const timestampMatch = new Date(payment.timestamp).toLocaleString().toLowerCase().includes(timestampSearch);
        const cartIdMatch = cartId.toLowerCase().includes(cartIdSearch);
        
        return emailMatch && statusMatch && timestampMatch && cartIdMatch;
    });

    const filteredPaymentsData = filteredPayments.reduce((result, cartId) => {
        result[cartId] = paymentsData[cartId];
        return result;
    }, {});

    displayPayments(filteredPaymentsData);  // Re-render the filtered payments
}

// Function to update payment status
async function updatePaymentStatus(event) {
    const cartId = event.target.getAttribute('data-cart-id');
    const userId = auth.currentUser?.uid;
    const currentStatus = event.target.getAttribute('data-status');
    const statusDisplay = event.target.closest('.payment-item').querySelector('.status-display');

    if (userId) {
        const paymentRef = dbRef(db, `archivedCarts/${userId}/${cartId}`);
        const paymentSnapshot = await get(paymentRef);

        if (paymentSnapshot.exists()) {
            // Toggle the status between 'completed' and 'viewed'
            const newStatus = currentStatus === 'completed' ? 'viewed' : 'completed';

            // Update status in Firebase
            await update(paymentRef, {
                status: newStatus
            });

            // Update the UI status
            statusDisplay.innerHTML = `Status: ${newStatus}`;

            // If status is 'viewed', show an alert
            if (newStatus === 'viewed') {
                alert('Payment status updated to "viewed"');
            }

            // Update the button's data-status attribute to the new status
            event.target.setAttribute('data-status', newStatus);
        } else {
            alert('Payment not found.');
        }
    }
}

// Check authentication and load payments when the user is logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadPayments(user.uid);
    } else {
        document.getElementById('paymentsContainer').innerHTML = 'Please log in to view your payment data.';
    }
});

// Attach event listeners for search input fields after everything is loaded
document.getElementById('searchEmail').addEventListener('input', searchCartData);
document.getElementById('searchStatus').addEventListener('input', searchCartData);
document.getElementById('searchTimestamp').addEventListener('input', searchCartData);
document.getElementById('searchCartId').addEventListener('input', searchCartData);


