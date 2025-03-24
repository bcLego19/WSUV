const detailsElements = document.querySelectorAll('details');

detailsElements.forEach(details => {
  details.addEventListener('toggle', () => {
    // Close other details elements
    detailsElements.forEach(otherDetails => {
      if (otherDetails !== details) {
        otherDetails.open = false;
      }
    });
  });
});