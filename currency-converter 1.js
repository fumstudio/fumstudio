const conversionRates = {
  'USD': 0.1,
  'EUR': 0.9145,
  'ZAR': 18.3410, // Rand to USD rate
};

// Function to convert prices to selected currency
function convertCurrency(currency) {
  const products = document.querySelectorAll('.price');
  
  products.forEach(product => {
    const price = parseFloat(product.dataset.price);
    
    if (conversionRates[currency]) {
      const convertedPrice = price * conversionRates[currency];
      product.textContent = ` ${currency} ${convertedPrice.toFixed(2)}`;
    } else {
      console.error(`Conversion rate not found for ${currency}`);
    }
  });
}

// Retrieve the selected currency from localStorage
const selectedCurrency = localStorage.getItem('selectedCurrency') || 'ZAR';

// Convert prices to the selected currency
convertCurrency(selectedCurrency);