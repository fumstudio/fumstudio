import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
        import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";
        import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

        // Firebase configuration
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

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);
        const auth = getAuth(app);

        // Conversion rates (static for now, could be dynamic)
        const conversionRates = {
            'USD': 0.1,
            'EUR': 0.9145,
            'ZAR': 18.3410,
        };

        function convertPrice(price, currency) {
            if (currency === 'USD') {
                return (price / conversionRates['ZAR'] * conversionRates['USD']).toFixed(2);
            } else if (currency === 'EUR') {
                return (price / conversionRates['ZAR'] * conversionRates['EUR']).toFixed(2);
            } else {
                return price.toFixed(2); // Assuming ZAR is the base currency
            }
        }

function convertCurrency(currency) {
    const products = document.querySelectorAll('.price');
    products.forEach(product => {
        const price = parseFloat(product.dataset.price);
        
        // Check if price is valid
        if (!isNaN(price) && conversionRates[currency]) {
            const convertedPrice = convertPrice(price, currency);
            product.textContent = `${currency} ${convertedPrice}`; // Display the converted price
        } else {
            product.textContent = ''; // Display an empty string if price is invalid
        }
    });
}

        // Fetch the selected currency from Firebase
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const userId = user.uid;
                const userRef = ref(db, `users/${userId}/selectedCurrency`);

                get(userRef).then((snapshot) => {
                    let selectedCurrency = 'ZAR'; // Default to ZAR if no selection is found
                    if (snapshot.exists()) {
                        selectedCurrency = snapshot.val();
                    }

                    // Convert prices to the selected currency
                    convertCurrency(selectedCurrency);
                }).catch((error) => {
                    console.error("Error fetching selected currency from Firebase:", error);
                });
            } else {
                console.log("No user is signed in.");
            }
        });