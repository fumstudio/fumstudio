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
        
        if (conversionRates[currency]) {
            const convertedPrice = convertPrice(price, currency);
            product.textContent = `${currency} ${convertedPrice}`; // Fixed template literal syntax
        } else {
            console.error('Conversion rate not found for ' + currency);
        }
    });
}

// Retrieve the selected currency from localStorage
const selectedCurrency = localStorage.getItem('selectedCurrency') || 'ZAR';

// Convert prices to the selected currency
convertCurrency(selectedCurrency);