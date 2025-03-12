const conversionRates = { 
  'USD': 0.1,
  'EUR': 0.9145,
  'ZAR': 18.3410, // Rand to USD rate
};

function convertCurrency(currency) {
  const products = document.querySelectorAll('.price, .slashed-price'); // Select both price types

  products.forEach(product => {
    const price = parseFloat(product.dataset.price); // Parse the price

    if (conversionRates[currency]) {
      const convertedPrice = price / conversionRates['ZAR'] * conversionRates[currency];
      product.textContent = `${currency} ${convertedPrice.toFixed(2)}`; // Update text with converted price
    } else {
      console.error('Conversion rate not found for ' + currency);
    }
  });
}

// Retrieve the selected currency from localStorage
const selectedCurrency = localStorage.getItem('selectedCurrency') || 'USD';

// Convert prices to the selected currency
convertCurrency(selectedCurrency);