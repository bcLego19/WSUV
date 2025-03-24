

function setDetailsOpen() {
	
	const detailsElements = document.querySelectorAll('details');
	const breakpoint = 901; // adjust to desired width

	detailsElements.forEach(details => {
		if (window.innerWidth >= breakpoint) {
			details.open = true;
			details.disabled = true;
		} else {
			details.open = false;
			details.disabled = false;
		}
	});
}

// Call function on load
setDetailsOpen();

// Call function on window resize
window.addEventListener('resize' setDetailsOpen);