
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

    // Function to load payment data and sort by timestamp (descending order)
    async function loadPayments(userId) {
        const paymentsRef = dbRef(db, payments/${userId});
        const snapshot = await get(paymentsRef);

        if (snapshot.exists()) {
            paymentsData = snapshot.val(); // Store the payments data
            displayPayments(paymentsData);
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
                        formattedData += ${indent}${key}:\n${formatData(data[key], level + 1)};
                    } else {
                        formattedData += ${indent}${key}: ${data[key]}\n;
                    }
                }
            }
        } else {
            formattedData = ${indent}${data}\n;
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

            let imageContent = '';
            let imageStatusText = 'No image uploaded';
            if (payment.imageUrl) {
                imageContent = <img src="${payment.imageUrl}" alt="Uploaded Image" class="image-thumbnail" />;
                imageStatusText = payment.imageStatus || 'Uploaded';
            }

            paymentDiv.innerHTML = `
                <h3 class="payment-title">Cart ID: ${cartId}</h3> <!-- Added onClick to view the cart -->
                <p class="status-display">Status: ${payment.status}</p>
                <p>Timestamp: ${new Date(payment.timestamp).toLocaleString()}</p> <!-- Display timestamp in a readable format -->
                <h4>Profile</h4>
                ${formatProfile(payment.profile)}
                <button class="update-button" data-cart-id="${cartId}" data-status="${payment.status}">Toggle Status</button>
                <div class="drop-zone" data-cart-id="${cartId}">
                    ${imageContent ? <a href="${payment.imageUrl}" target="_blank">${imageContent}</a> : '<i class="fas fa-image icon"></i>'}
                </div>
                <input type="file" class="file-input" data-cart-id="${cartId}" accept="image/*" style="display:none;" />
                <button class="change-image-button" data-cart-id="${cartId}" style="display: ${payment.imageUrl ? 'block' : 'none'};">Change Image</button>
                <p class="image-status" id="status-${cartId}">${imageStatusText}</p>
<button class="toggle-button" id="toggleResponse-${cartId}">Toggle Response</button>
    <pre class="payment-response" id="response-${cartId}" style="display: none;">${formatData(payment.response)}</pre>
    
            `;

            paymentsContainer.appendChild(paymentDiv);
        });

document.getElementById('paymentsContainer').addEventListener('click', function (event) {
    // Toggle the visibility of the payment response when "Toggle Response" button is clicked
    if (event.target.classList.contains('toggle-button')) {
        const cartId = event.target.id.split('-')[1];  // Extract cartId from button ID
        const responseElement = document.getElementById(response-${cartId});

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
        // Attach event listeners to each Cart ID
        const paymentTitles = document.querySelectorAll('.payment-title');
        paymentTitles.forEach(title => {
            title.addEventListener('click', function() {
                const cartId = title.textContent.split('Cart ID: ')[1];
                viewCart(cartId); // Call viewCart with the Cart ID
            });
        });

        // Attach event listeners for file inputs, drop zones, and change image buttons
        document.querySelectorAll('.file-input').forEach(input => {
            input.addEventListener('change', handleFileSelect);
        });

        document.querySelectorAll('.drop-zone').forEach(dropZone => {
            dropZone.addEventListener('click', handleDropZoneClick);
            dropZone.addEventListener('dragover', handleDragOver);
            dropZone.addEventListener('drop', handleDrop);
        });

        document.querySelectorAll('.change-image-button').forEach(button => {
            button.addEventListener('click', handleChangeImage);
        });
    }

    // Function to handle when a user clicks a cart ID
    function viewCart(cartId) {
        window.location.href = http://localhost:7700/viewcart_id.html?cartId=${cartId};
    }

    // Function to handle file selection
    async function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            const cartId = event.target.getAttribute('data-cart-id');
            await uploadImage(cartId, file);
        }
    }

// Handle drop zone click (to upload image)
function handleDropZoneClick(event) {
    const cartId = event.target.getAttribute('data-cart-id');
    const fileInput = document.querySelector(.file-input[data-cart-id="${cartId}"]);
    
    // Check if fileInput exists before calling click()
    if (fileInput) {
        fileInput.click();
    } else {

    }
}

// Handle change image button click
async function handleChangeImage(event) {
    const cartId = event.target.getAttribute('data-cart-id');
    const fileInput = document.querySelector(.file-input[data-cart-id="${cartId}"]);
    
    // Check if fileInput exists before calling click()
    if (fileInput) {
        fileInput.click();
    } else {

    }
}
    // Handle drag over event for drop zone
    function handleDragOver(event) {
        event.preventDefault();  
    }

    // Handle image drop into the drop zone
    async function handleDrop(event) {
        event.preventDefault();  
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const cartId = event.target.getAttribute('data-cart-id');
            await uploadImage(cartId, files[0]);
        }
    }


    // Upload image to Firebase Storage
// Upload image to Firebase Storage
async function uploadImage(cartId, file) {
    const userId = auth.currentUser?.uid;
    if (userId) {
        const storageReference = storageRef(storage, images/${userId}/${cartId}/${file.name});
        const uploadTask = uploadBytesResumable(storageReference, file);

        const statusElement = document.getElementById(status-${cartId});
        statusElement.innerText = 'Uploading... 0%';

        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                statusElement.innerText = Uploading... ${Math.round(progress)}%;
            }, 
            (error) => {
                alert('Error uploading image: ' + error.message);
                statusElement.innerText = 'Error uploading image';
            }, 
            async () => {
                const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                const paymentRef = dbRef(db, payments/${userId}/${cartId});
                
                // Check if an image URL already exists
                const paymentDataSnapshot = await get(paymentRef);
                const currentPaymentData = paymentDataSnapshot.val();

                let newStatus = 'Uploaded';
                // If the image URL has been updated, set the status to "Changed"
                if (currentPaymentData.imageUrl && currentPaymentData.imageUrl !== imageUrl) {
                    newStatus = 'Changed';
                }

                // Update the payment record in the database with the new image URL and status
                await update(paymentRef, {
                    imageUrl,
                    imageStatus: newStatus
                });

                // Update the status text in the UI to reflect the change
                statusElement.innerText = newStatus;
                
                // Re-render the payments to reflect the changes
                displayPayments(paymentsData);
            }
        );
    }
}
    // Function to search cart data based on user input
    function searchCartData() {
        const emailSearch = document.getElementById('searchEmail').value.toLowerCase();
        const statusSearch = document.getElementById('searchStatus').value.toLowerCase();
        const timestampSearch = document.getElementById('searchTimestamp').value.toLowerCase();
        const cartIdSearch = document.getElementById('searchCartId').value.toLowerCase();

        const filteredPayments = Object.keys(paymentsData).filter(cartId => {
            const payment = paymentsData[cartId];
            const emailMatch = payment.profile?.email?.toLowerCase().includes(emailSearch);
            const statusMatch = payment.status?.toLowerCase().includes(statusSearch);
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
            const paymentRef = dbRef(db, payments/${userId}/${cartId});
            const paymentSnapshot = await get(paymentRef);

            if (paymentSnapshot.exists()) {
                // Toggle the status between 'completed' and 'viewed'
                const newStatus = currentStatus === 'completed' ? 'viewed' : 'completed';

                // Update status in Firebase
                await update(paymentRef, {
                    status: newStatus
                });

                // Update the UI status
                statusDisplay.innerHTML = Status: ${newStatus};

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

    // Event listeners for search input fields
    document.getElementById('searchEmail').addEventListener('input', searchCartData);
    document.getElementById('searchStatus').addEventListener('input', searchCartData);
    document.getElementById('searchTimestamp').addEventListener('input', searchCartData);
    document.getElementById('searchCartId').addEventListener('input', searchCartData);

    // Event listener for toggle status buttons
    document.getElementById('paymentsContainer').addEventListener('click', function (event) {
        if (event.target.classList.contains('update-button')) {
            updatePaymentStatus(event);
        }
    });

    // Check authentication and load payments when the user is logged in
    onAuthStateChanged(auth, (user) => {
        if (user) {
            loadPayments(user.uid);
        } else {
            document.getElementById('paymentsContainer').innerHTML = 'Please log in to view your payment data.';
        }
    });
