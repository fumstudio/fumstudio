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

// Function to format data object recursively
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
}

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

// Upload image to Firebase Storage
async function uploadImage(cartId, file) {
    const userId = auth.currentUser?.uid;
    if (userId) {
        // Create a reference to upload the image to Firebase Storage
        const storageReference = storageRef(storage, `images/${userId}/${cartId}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageReference, file);

        // Get the status element to show upload progress
        const statusElement = document.getElementById(`status-${cartId}`);
        statusElement.innerText = 'Uploading... 0%';

        uploadTask.on('state_changed', 
            (snapshot) => {
                // Calculate upload progress
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                statusElement.innerText = `Uploading... ${Math.round(progress)}%`;
            }, 
            (error) => {
                // Handle upload error
                alert('Error uploading image: ' + error.message);
                statusElement.innerText = 'Error uploading image';
            }, 
            async () => {
                // Once the upload is complete, get the image URL
                const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                const paymentRef = dbRef(db, `payments/${userId}/${cartId}`);

                // Check if there is already an image URL in the payment record
                const paymentDataSnapshot = await get(paymentRef);
                const currentPaymentData = paymentDataSnapshot.val();

                let newStatus = 'Uploaded'; // Default status for the uploaded image
                if (currentPaymentData?.imageUrl) {
                    newStatus = 'Updated'; // If there's already an image, we update the status
                }

                // Update the payment record with the new image URL and status
                await update(paymentRef, {
                    imageUrl: imageUrl,
                    imageStatus: newStatus
                });

                // Update the status text
                statusElement.innerText = newStatus;
                displayPayments(paymentsData); // Re-display payments to update the status
            }
        );
    }
}

// Update payment status (Toggle between different statuses)
async function updatePaymentStatus(event) {
    const cartId = event.target.dataset.cartId;
    const newStatus = event.target.dataset.status === 'pending' ? 'completed' : 'pending';

    const userId = auth.currentUser?.uid;
    if (userId && cartId) {
        const paymentRef = dbRef(db, `payments/${userId}/${cartId}`);
        await update(paymentRef, { status: newStatus });
        event.target.dataset.status = newStatus; // Update the button status attribute
        event.target.innerText = `Status: ${newStatus}`;
    }
}

// Firebase authentication state change
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userId = user.uid;
        loadPayments(userId);
    } else {
        alert('User not authenticated');
    }
});



