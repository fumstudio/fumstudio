function toggleDetails() {
        const details = document.getElementById('details');
        if (details.style.display === 'none' || details.style.display === '') {
            details.style.display = 'block';
            details.scrollIntoView({ behavior: 'smooth' });
            // Add small scrolling effect
            window.scrollBy({
                top: 200, // Scroll down by 200 pixels
                behavior: 'smooth' // Smooth scroll
            });
        } else {
            details.style.display = 'none';
        }
    }

const orderButton = document.getElementById('orderButton');
        const orderForm = document.getElementById('orderForm');

        // Generate a unique key based on the current page's file name
        const pageKey = `formVisible_${window.location.pathname}`;

        // Check local storage and set form visibility on page load
        document.addEventListener('DOMContentLoaded', () => {
            const formVisible = localStorage.getItem(pageKey) === 'true';
            if (formVisible) {
                orderForm.style.display = 'block';
            } else {
                orderForm.style.display = 'none';
            }
        });

        orderButton.addEventListener('click', () => {
            if (orderForm.style.display === 'none' || orderForm.style.display === '') {
                orderForm.style.display = 'block'; // Show the form
                
                // Save visibility state to local storage with unique key
                localStorage.setItem(pageKey, 'true');
                
                // Scroll a little bit to the form
                window.scrollBy({
                    top: 200, // Change this value to control the scroll distance
                    behavior: 'smooth'
                });
            } else {
                orderForm.style.display = 'none'; // Hide the form
                
                // Save visibility state to local storage with unique key
                localStorage.setItem(pageKey, 'false');
            }
        });