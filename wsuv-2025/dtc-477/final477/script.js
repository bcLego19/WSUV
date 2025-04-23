/* FOR DEBUGGING ONLY */
const debug = false;
/* FOR DEBUGGING ONLY */

// get interactive elements (multiple expected)
const hamburger = document.querySelectorAll("#hamburger");
const hamburgerMenu = document.querySelectorAll("#hamburger-menu");
const eventToggles = document.querySelectorAll(".event-toggle");

// variable definitions
let isHamburgerActive = [];
let currentEvent = null;
let hamburgerHolder = {
  "icon": null,
  "menu": null,
};
let isScrollingFromMenu = false;

/* Setup Code */

// create array of booleans for the number of hamburger menus
for (let i = 0; i < hamburgerMenu.length; i++) {
    let items = hamburgerMenu[i].querySelectorAll(".hamburger-item");

    for (let j = 0; j < items.length; j++) {
      const scrollDuration = 1500; // Set your desired duration in milliseconds (e.g., 1000ms = 1 second)
      items[j].addEventListener('click', (e) => {
        isScrollingFromMenu = true; // Set the flag
        hamburgerToggle(i);
        const targetId = items[j].getAttribute('data-target');
        const targetSection = document.getElementById(targetId); // Get the content section

        console.log('Target ID:', targetId);
        const targetElement = document.getElementById(targetId);
        console.log('Target Element:', targetElement);

        if (targetSection) {
            let scrollToY = targetSection.offsetTop;
            const fixedHeader = document.querySelector('header'); // Make sure this selector is correct
            if (fixedHeader) {
                scrollToY -= fixedHeader.offsetHeight;
            }
            smoothScrollWindow(scrollToY, scrollDuration);

            const allDescriptions = document.querySelectorAll('.event-desc');
            for (let k = 0; k < allDescriptions.length; k++) {
                allDescriptions[k].classList.remove('active');
            }
            const correspondingDesc = targetElement.querySelector('.event-desc');
            if (correspondingDesc) {
                correspondingDesc.classList.add('active');
            }
            updateScrollRelatedData();

            const index = Array.from(contentElement.children).findIndex(child => child.id === targetId);
            if (index !== -1 && elements[index] && elements[index].toggle) {
                elements[index].toggle.click();
            }

            if (index !== -1 && stationPositions.length > index) {
                if (debug) console.log(`Menu item clicked, moving train to index ${index}`);
                targetStationX = trackXCenter - trainWidth / 2;
                targetStationY = stationPositions[index].y;
                initialTrainY = trainY + trainHeight / 2;
                trainSpeed = originalTrainSpeed;
                isMoving = true;
            }
        }
        // Optionally reset the flag after a short delay or when scrolling completes
        setTimeout(() => {
            isScrollingFromMenu = false;
        }, scrollDuration); // Match your scroll duration
    });
    isHamburgerActive.push(false);
  }
}

/* event listener code */

// add event listeners to all hamburger menus (check if exists and equal number of icons and menus)
if (hamburger != null && hamburgerMenu != null && hamburger.length == hamburgerMenu.length) {
  for (let i = 0; i < hamburger.length; i++) {
    hamburger[i].addEventListener("click", (e) => {
      hamburgerToggle(i);
    });
  }
}

/* function definitions */
// function to handle toggling hamburger menu
function hamburgerToggle(index) {
  hamburgerHolder.icon = hamburger[index];
  hamburgerHolder.menu = hamburgerMenu[index];
  let isActive = isHamburgerActive[index];
  isActive = !isActive;
  if (isActive) { // if active, display the menu and change the icon to exit
    hamburgerHolder["menu"].style.display = "block";
    hamburgerHolder["icon"].classList.add("fa-times-circle-o");
    hamburgerHolder["icon"].classList.remove("fa-bars");
  } else { // else, hide menu and change icon to bars
    hamburgerHolder["menu"].style.display = "none";
    hamburgerHolder["icon"].classList.remove("fa-times-circle-o");
    hamburgerHolder["icon"].classList.add("fa-bars");
  }
  isHamburgerActive[index] = isActive;
}

// Function to draw the train signal on the canvas
function drawSignal(canvas, isToggled, transitionProgress = 0) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const bottomY = height * 0.7;
    const topY = height * 0.3;
    const radius = Math.min(width, height * 0.3) / 2;
    const centerX = width / 2;

    ctx.clearRect(0, 0, width, height); // Clear the canvas

    // --- Draw Black Oval Background ---
    ctx.beginPath();
    const ovalWidth = radius * 2 * 0.8; // Adjust for desired oval width
    const ovalHeight = (bottomY - topY + 2 * radius) * 0.6; // Adjust for desired oval height
    ctx.ellipse(centerX, height / 2, ovalWidth, ovalHeight, 0, 0, 2 * Math.PI);
    ctx.fillStyle = 'black';
    ctx.fill();

    let bottomColor = isToggled ? 'grey' : 'green';
    let topColor = isToggled ? 'red' : 'grey';

    if (transitionProgress > 0 && transitionProgress < 1) {
        const greenToGrey = `rgba(128, 128, 128, ${1 - transitionProgress})`;
        const greyToGreen = `rgba(0, 128, 0, ${transitionProgress})`;
        const redToGrey = `rgba(128, 128, 128, ${1 - transitionProgress})`;
        const greyToRed = `rgba(255, 0, 0, ${transitionProgress})`;

        bottomColor = isToggled ? greyToRed : greenToGrey;
        topColor = isToggled ? redToGrey : greyToGreen;
    }

    // Draw bottom circle
    ctx.beginPath();
    ctx.arc(centerX, bottomY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = bottomColor;
    ctx.fill();
    ctx.stroke(); // Optional: add a stroke for better definition

    // Draw top circle
    ctx.beginPath();
    ctx.arc(centerX, topY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = topColor;
    ctx.fill();
    ctx.stroke(); // Optional: add a stroke
}

// --- P5.js Setup ---
let canvasWidth = 300;
let canvasHeight = 0;
let canvas;
let trackXCenter;
let trackSpacing = 20;
let trackColor;
let trackThickness = 5;
let trackLength;
let tieWidth = trackSpacing * 2;
let tieHeight = 3;
let tieColor;
let tieSpacing = 50;
let stationInterval = 150;
let stationWidth = 40;
let stationHeight = 30;
let stationColor;
let stationOffset = 50;
let barrierWidth = 50;
let barrierHeight = 10;
let barrierColor;
let barrierOffset = 20;
let scrollSpeed = 1;
let scrollOffset = 0;
let timelineElement;
let contentElement;
let elements = [];
let canvasContainer;
const minStationSpacing = 50;
let stationClickEvents = [];
let trainX;
let trainY;
let trainSpeed = 0;
let targetStationX;
let targetStationY;
let isMoving = false;
let trainColor = '#222';
let trainWidth = 30;
let trainHeight = 40;
let trainAcceleration = 0.1;
let trainDirection = 0;
let stationPositions = [];
let initialTrainY;
const originalTrainSpeed = 2;
const fasterTrainSpeed = originalTrainSpeed * 1.5;
const maxTrainSpeed = originalTrainSpeed * 2.0;

// --- Helper Functions ---

// function to determine the height of each content section.
function calculateSectionHeights() {
  sectionHeights = [];
  const contentEvents = document.querySelectorAll('.content-event');
  for (let i = 0; i < contentEvents.length; i++) {
    sectionHeights.push(contentEvents[i].offsetHeight);
  }
}

// function to calculate initial station positioning
function calculateInitialStationPositions() {
  stationPositions = [];
  const stationVerticalOffset = stationHeight; // Offset to the vertical center.
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    if (typeof element.initialTitleOffsetTopTimeline === 'number') {
      const stationY = element.initialTitleOffsetTopTimeline + stationVerticalOffset;
      let stationX;
      if (i % 2 === 0) {
        stationX = trackXCenter - stationOffset - stationWidth; // Left side.
      } else {
        stationX = trackXCenter + stationOffset; // Right side.
      }
      stationPositions.push({ x: stationX, y: stationY }); // Store station center Y.
    }
  }
  if (debug) console.log(`calculateInitialStationPositions() - stationPositions:`, stationPositions);
}

// --- p5.js Lifecycle Functions ---

function setup() {
  // Get HTML elements for timeline, canvas, and content
  timelineElement = document.getElementById('timeline');
  canvasContainer = document.getElementById('canvas');
  contentElement = document.getElementById('content');
  // Call the 'updateElementData' function to populate the 'elements' array with information about the content sections.
  updateElementData();

  // 6. Check if the 'elements' array contains at least two elements. This condition likely determines if the timeline visualization should be drawn.
  if (elements.length >= 2) {
    // 7. Set the 'canvasHeight' to the 'scrollHeight' of the 'contentElement'. This makes the canvas tall enough to accommodate all the content.
    canvasHeight = contentElement.scrollHeight;
    // 8. Create a p5.js canvas with the predefined 'canvasWidth' and the dynamically determined 'canvasHeight'. Store the resulting canvas object in the 'canvas' variable.
    canvas = createCanvas(canvasWidth, canvasHeight);
    // 9. Make the 'canvas' a child of the 'canvasContainer' HTML element, embedding it in the page.
    canvas.parent(canvasContainer);
    // 10. Calculate the horizontal center of the canvas and store it in 'trackXCenter'.
    trackXCenter = canvasWidth / 2;
    // 11. Set the 'trackColor' using the p5.js 'color()' function with RGB values (100, 100, 100).
    trackColor = color(100); // set track colors to RGB 100
    // 12. Set the 'tieColor' using the p5.js 'color()' function with RGB values (80, 80, 80).
    tieColor = color(80);    // set tie colors
    stationColor = color(150); // set each station to RGB 150
    barrierColor = color(200, 0, 0);
    trackLength = canvasHeight - 2 * barrierOffset;
    trainX = trackXCenter - trainWidth / 2;
    trainY = barrierOffset + trainHeight / 2;
    calculateInitialStationPositions(); // Call this new function
    loop();
  }

  // add event listener for resize events
  window.addEventListener('resize', function() {
    // call to update the element data collected
    updateElementData();
    // check again if elements length is 2 or more
    if (elements.length >= 2) {
      // Update canvas height on resize as well
      canvasHeight = contentElement.scrollHeight;
      resizeCanvas(canvasWidth, canvasHeight);
      trackLength = canvasHeight - 2 * barrierOffset;
      scrollOffset = 0;
      // if canvas does not exist, make a new one.
      if (!canvas) {
        canvasHeight = contentElement.scrollHeight;
        canvas = createCanvas(canvasWidth, canvasHeight);
        canvas.parent(canvasContainer);
        trackXCenter = canvasWidth / 2;
        trackColor = color(100);
        tieColor = color(80);
        stationColor = color(150);
        barrierColor = color(200, 0, 0);
        trackLength = canvasHeight - 2 * barrierOffset;
        loop();
      }
    } else { // if elements less than 2 and canvas exists, stop looping and set canvas to null.
      if (canvas) {
        noLoop();
        canvas = null;
      }
    }
  });
}

// Draw function runs repeatedly during the p5.js loop.
function draw() {
  if (debug) {
    console.log("draw() called");
    console.log(`canvas dim (width, height): (${width}, ${height})`);
    console.log("elements.length:", elements.length);
  }
  
  if (elements.length < 2) {
    console.log("Exiting draw() because elements.length < 2");
    return;
  }
  // 1. Draw the gentle green background
  background('#bEfEd4');
  noStroke();

  // 2. Draw the brown rectangle
  fill('#e47430'); // Use a very obvious color for debugging
  rect(width/2 - 25, 0, 50, height);

  // 3. Draw the track and other elements (Keep for now)
  stroke(trackColor);
  strokeWeight(trackThickness);
  line(trackXCenter - trackSpacing / 2, barrierOffset, trackXCenter - trackSpacing / 2, canvasHeight - barrierOffset); // Left rail.
  line(trackXCenter + trackSpacing / 2, barrierOffset, trackXCenter + trackSpacing / 2, canvasHeight - barrierOffset); // Right rail.
  noStroke();

  // --- Draw Ties ---
  fill(tieColor);
  let tieY = barrierOffset;
  let currentTieSpacing = tieSpacing;
  while (tieY < canvasHeight - barrierOffset) {
    rect(trackXCenter - tieWidth / 2, tieY - tieHeight / 2, tieWidth, tieHeight);
    tieY += currentTieSpacing;
  }

  // --- Draw Stations (Using initial fixed offsetTop relative to #timeline) ---
  fill(stationColor);
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    if (typeof element.initialTitleOffsetTopTimeline === 'number' && stationPositions[i]) { // Ensure stationPositions has the element
      const stationX = stationPositions[i].x;
      const stationY = stationPositions[i].y;
      rect(stationX, stationY - stationHeight / 2, stationWidth, stationHeight); // Draw centered.
    }
  }
  if (debug) console.log(`draw() - stationPositions:`, stationPositions);

  // --- Draw Barriers ---
  fill(barrierColor);
  rect(trackXCenter - barrierWidth / 2, barrierOffset - barrierHeight / 2, barrierWidth, barrierHeight); // Top barrier.
  rect(trackXCenter - barrierWidth / 2, canvasHeight - barrierOffset - barrierHeight / 2, barrierWidth, barrierHeight); // Bottom barrier.

  // --- Handle Scrolling ---
  scrollOffset += scrollSpeed;
  if (scrollOffset > trackLength + stationInterval) {
    scrollOffset = 0; // Loop the scroll.
  }

  // --- Handle Train Movement ---
  if (isMoving) {
    if (debug) console.log('Train is moving, targetStationY:', targetStationY, 'trainY:', trainY, 'initialTrainY:', initialTrainY);
    const dy = targetStationY - initialTrainY; // Total vertical distance.
    const currentDistance = (trainY + trainHeight / 2) - initialTrainY; // Current distance traveled.
    const ratio = Math.abs(dy) > 0 ? Math.abs(currentDistance / dy) : 0;
    const distanceToStart = Math.abs((trainY + trainHeight / 2) - initialTrainY);
    const distanceToEnd = Math.abs((trainY + trainHeight / 2) - targetStationY);
    const threshold = 50; // Define your distance threshold in pixels

    if (distanceToStart <= threshold || distanceToEnd <= threshold) {
      trainSpeed = originalTrainSpeed * 0.5; // Use half original speed near start or end
    } else if (distanceToStart <= (threshold * 2) || distanceToEnd <= (threshold * 2)) {
      trainSpeed = originalTrainSpeed; // Use original speed near start or end
    } else if (distanceToStart <= (threshold * 3) || distanceToEnd <= (threshold * 3)) {
      trainSpeed = fasterTrainSpeed; // Use original speed near start or end
    } else {
      trainSpeed = maxTrainSpeed; // Use maximum speed when far from start and end
    }

    trainY += Math.sign(dy) * trainSpeed; // Update train Y position.

    if (Math.abs(targetStationY - (trainY + trainHeight / 2)) < 1) {
      trainY = targetStationY - trainHeight / 2; // Snap to target.
      isMoving = false;
      trainSpeed = 0; // Stop the train.
    }
  }
  trainY = constrain(trainY, barrierOffset + trainHeight / 2, canvasHeight - barrierOffset - trainHeight / 2); // Keep train within bounds.
  drawTrain(); // Render the train.
}

// Function to update the 'elements' array with data from the DOM.
function updateElementData() {
  elements = [];
  const containerChildren = contentElement.children;
  const timelineRectTopInitial = timelineElement.getBoundingClientRect().top + window.scrollY;
  for (let i = 0; i < containerChildren.length; i++) {
    const child = containerChildren[i];
    const height = parseInt(child.offsetHeight);
    const titleElement = child.querySelector('.event-title h2');
    let initialTitleOffsetTopTimeline = null;
    if (titleElement) {
      const titleRectTopInitial = titleElement.getBoundingClientRect().top + window.scrollY;
      initialTitleOffsetTopTimeline = titleRectTopInitial - timelineRectTopInitial;
    }
    elements.push({ element: child, height: height, toggle: child.querySelector('.event-toggle'), desc: child.querySelector('.event-desc'), yPosition: child.offsetTop, initialTitleOffsetTopTimeline: initialTitleOffsetTopTimeline });
  }
  if (elements.length < 2) { if (canvas) { noLoop(); canvas = null; } }
  attachStationClickHandlers(); // Attach listeners to station toggles.
}

// Function to update vertical positions of elements based on scroll.
function updateScrollRelatedData() {
  const containerChildren = contentElement.children;
  for (let i = 0; i < containerChildren.length; i++) {
    const child = containerChildren[i];
    elements[i].yPosition = child.offsetTop;
  }
}

// Function for smooth scrolling animation.
function smoothScrollWindow(targetY, duration) {
  const startY = window.scrollY || window.pageYOffset;
  const startTime = performance.now();

  function scrollStep(timestamp) {
    const currentTime = timestamp - startTime;
    if (currentTime >= duration) {
      window.scrollTo(0, targetY);
      return;
    }

    // function ease takes in number t and returns specific value after comparison check
    // if t < 0.5, return 4 times t cubed, else return
    // (t - 1) * (2 * t - 2)^2 + 1
    const ease = (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    const scrollAmount = startY + (targetY - startY) * ease(currentTime / duration);
    window.scrollTo(0, scrollAmount);
    requestAnimationFrame(scrollStep);
  }

  requestAnimationFrame(scrollStep);
}

// Function to attach click event listeners to the station toggles
function attachStationClickHandlers() {
    for (let i = 0; i < stationClickEvents.length; i++) {
        const event = stationClickEvents[i];
        event.target.removeEventListener('click', event.listener);
    }
    stationClickEvents = [];

    const scrollOffsetAdjustment = -50; // Adjust this value as needed
    const toggleStates = elements.map((_, index) => index === 0); // Initialize all to false except the first

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const toggleCanvas = element.toggle;
        if (toggleCanvas && typeof element.initialTitleOffsetTopTimeline === 'number') {
            // Draw the initial signal based on the toggle state
            drawSignal(toggleCanvas, toggleStates[i]);

            const listener = function() {
                if(debug) console.log('Toggle clicked for element at index:', i); // Debugging line

                // --- Close Hamburger Menu if Open ---
                for (let j = 0; j < isHamburgerActive.length; j++) {
                    if (isHamburgerActive[j]) {
                        hamburgerToggle(j);
                    }
                }
                // --- End Close Hamburger Menu ---

                toggleStates.fill(false);
                toggleStates[i] = true;

                const animationDuration = 300;
                let startTime;
                const allToggles = document.querySelectorAll('.event-toggle');

                function animateTransition(timestamp) {
                    if (!startTime) startTime = timestamp;
                    const elapsedTime = timestamp - startTime;
                    const progress = Math.min(1, elapsedTime / animationDuration); // Normalize progress

                    for (let j = 0; j < allToggles.length; j++) {
                        drawSignal(allToggles[j], toggleStates[j], progress);
                    }

                    if (progress < 1) {
                        requestAnimationFrame(animateTransition);
                    } else {
                        // Final draw of all toggles in their new states
                        for (let j = 0; j < allToggles.length; j++) {
                            drawSignal(allToggles[j], toggleStates[j]);
                        }

                        // --- Conditional Scrolling ---
                        if (!isScrollingFromMenu) {
                            const targetScrollY = element.element.offsetTop + scrollOffsetAdjustment; // Use element.element.offsetTop
                            const scrollDuration = 1500;
                            setTimeout(smoothScrollWindow(targetScrollY, scrollDuration), scrollDuration);
                        }

                        if (element.desc) {
                            const allDescriptions = document.querySelectorAll('.event-desc');
                            for (let j = 0; j < allDescriptions.length; j++) {
                                allDescriptions[j].classList.remove('active');
                            }
                            element.desc.classList.toggle('active');
                        }

                        updateScrollRelatedData();
                        if (debug) console.log(`  After scroll data update - Element ${i}: yPosition = ${element.yPosition}`);

                        // ... (rest of your canvas/train logic) ...
                        if (elements.length >= 2) {
                            canvasHeight = contentElement.scrollHeight;
                            if (!canvas) {
                                canvas = createCanvas(canvasWidth, canvasHeight);
                                canvas.parent(canvasContainer);
                                trackXCenter = canvasWidth / 2;
                                trackColor = color(100);
                                tieColor = color(80);
                                stationColor = color(150);
                                barrierColor = color(200, 0, 0);
                                trackLength = canvasHeight - 2 * barrierOffset;
                                loop();
                            } else {
                                resizeCanvas(canvasWidth, canvasHeight);
                                trackLength = canvasHeight - 2 * barrierOffset;
                            }
                        } else {
                            if (canvas) {
                                noLoop();
                                canvas = null;
                            }
                        }

                        if (stationPositions.length > i) {
                            if (debug) console.log(`  Moving train to station at index ${i}, Station Y (center): ${stationPositions[i].y}`);
                            targetStationX = trackXCenter - trainWidth / 2;
                            targetStationY = stationPositions[i].y;
                            initialTrainY = trainY + trainHeight / 2;
                            trainSpeed = originalTrainSpeed;
                            isMoving = true;
                            if(debug) console.log('isMoving set to true, targetStationY:', targetStationY, 'initialTrainY:', initialTrainY, 'trainSpeed:', trainSpeed);
                        } else {
                            if (debug) console.log(`  stationPositions array too short (${stationPositions.length}) for index ${i}`);
                        }
                    }
                }

                requestAnimationFrame(animateTransition);
            };
            toggleCanvas.addEventListener('click', listener);
            stationClickEvents.push({ target: toggleCanvas, listener: listener });
        }
    }
}

// Function to draw the train
function drawTrain() {
  // Save the current drawing style settings
  push();
  // Translate the origin to the center of the train
  translate(trainX + trainWidth / 2, trainY + trainHeight / 2);
  // Rotate the train by 90 degrees (HALF_PI in radians)
  rotate(HALF_PI);
  // Set the fill color of the train
  fill(trainColor);
  // Draw the main body of the train as a rectangle
  rect(-trainHeight / 2, -trainWidth / 2, trainHeight, trainWidth);
  // Set the fill color for the train's front (red)
  fill(255, 0, 0);
  // Draw a triangle for the front of the train
  triangle(
    trainHeight / 2 + 10, 0,
    trainHeight / 2, trainWidth / 2,
    trainHeight / 2, -trainWidth / 2
  );
  // Restore the previous drawing style settings
  pop();
}

// Event listener that runs after the HTML document is fully loaded.
document.addEventListener('DOMContentLoaded', function() {
  const eventTitleElements = document.querySelectorAll('.event-title');
  const timelineElement = document.querySelector("#timeline");

  function checkVisibility() {
    if (debug) console.log("checking visibility...");
    if (!timelineElement) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop; // Get body's scroll top
    const timelineTopViewport = timelineElement.getBoundingClientRect().top;
    const visibilityThreshold = 300; // Adjust as needed

    if(debug)console.log(`BODY SCROLL TOP: ${scrollTop}`); // Log the body's scroll top

    for (let i = 0; i < eventTitleElements.length; i++) {
      const titleElement = eventTitleElements[i];
      const titleTopRelativeToTimeline = titleElement.offsetTop; // Relative to #timeline

      // Calculate the title's absolute position relative to the top of the document
      const titleTopAbsolute = timelineElement.offsetTop + titleTopRelativeToTimeline;

      // Calculate the title's position relative to the *viewport*
      const titleTopVisible = titleTopAbsolute - scrollTop;

      const isVisible = titleTopVisible >= 100 && titleTopVisible < visibilityThreshold;

      if (isVisible) {
        titleElement.classList.add('visible');
      } else {
        titleElement.classList.remove('visible');
      }
    }
  }

  window.addEventListener("scroll", checkVisibility); // Listen to window scroll

  checkVisibility(); // Initial call
});