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
        return price.toFixed(2);
    }
}

function convertCurrency(currency, totalPriceElement) {
    const amount = parseFloat(totalPriceElement.getAttribute('data-price'));
    const convertedTotalPrice = convertPrice(amount, currency);
    totalPriceElement.innerText = `${currency} ${convertedTotalPrice}`;
}