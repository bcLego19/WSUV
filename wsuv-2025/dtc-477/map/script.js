
// Mapbox Token
mapboxgl.accessToken = "pk.eyJ1IjoiZHJwaG9lbml4IiwiYSI6ImNtN2NtbWdsYTBqMzAyanE3ajQwamYybzAifQ.5t8NcVmDQO-RI4wB5wZosQ";

// Global for initial coordinates
const GLOBE_CENTER = [-25, 37];

// Global for min and max zoom
const MIN_ZOOM = 2;
const MAX_ZOOM = 4.5;

// Global for last update of page
const LAST_UPDATE = "March 19th, 2025";

// Reserve initial map state for later
const initialMapState = {
    center: GLOBE_CENTER,
    zoom: MIN_ZOOM,
    pitch: 0,
    bearing: 0
}

// Get interactive buttons
const resetButton = document.querySelector('#resetMap');
const playPauseButton = document.querySelector('#playPauseButton');
const creditButton = document.querySelector('#resource-links');

// get hamburger menu elements
const hamburgerMenuButton = document.querySelector("#hamburger");
const hamburgerMenu = document.querySelector(".hamburger-menu");
const categoryMenu = document.querySelector("#category-container");

// Get all the circular tab elements
const tabs = document.querySelectorAll('.category-item');
const texts = document.querySelectorAll('.tab-text');

// Setup initial appearance of map
const map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/drphoenix/cm7ttbsz1009k01sidsod6yk8',
	center: GLOBE_CENTER,
	zoom: MIN_ZOOM 		// Initial zoom level
});

// The following values can be changed to control rotation speed:

// At low zooms, complete a revolution every two minutes.
const secondsPerRevolution = 120;
// Above zoom level 5, do not rotate.
const maxSpinZoom = 5;
// Rotate at intermediate speeds between zoom levels 3 and 5.
const slowSpinZoom = 3;

// values to control timeout for menu
const FOUR_SECOND = 4000; // 4000 milliseconds = 4 seconds
const HALF_SECOND = 500; // 500 milliseconds = 0.5 seconds

// boolean to control spinning globe
let spinEnabled = true;
let userInteracting = false;

// array to hold current points
let currentPoints = [];

// boolean to control hamburger menu
let hamburgerToggle = false;
let hamburgerToggleControl = false;

// function to toggle true/false of hamburger control
function menuControlOn() {
    hamburgerToggleControl = true;
}

function menuControlOff() {
    hamburgerToggleControl = false;
}

// toggle to close the hamburger menu after timeout
function closeMenuOnLeave(timeValue) {
    // set control
    menuControlOn();

    // toggle after timeValue
    setTimeout(function() {
        hamburgerToggle = false;
        hamburgerSwitch(hamburgerMenu, hamburgerToggle);
    }, timeValue);

    // unset control
    menuControlOff();

}

// function to toggle display of menu
function hamburgerSwitch(menu, toggle) {
  if(toggle) {
    // change display of the menu
    menu.style.display = "grid";
    // show the menu after timeout
    setTimeout(function(){
        showCategoryMenu();
    }, HALF_SECOND);
  } else {
    // hide menu
    hideCategoryMenu();
    // change display after timeout
    setTimeout(function(){
        menu.style.display = "none";
    }, HALF_SECOND);
  }
}

// function to remove all points
function removePoints() {
	currentPoints.forEach(point => point.remove());
	currentPoints = [];
}

// function to get points given specific category
function getCategoryPoints(categoryIndex) {

    //remove existing points
    removePoints();

    // define category index that matches text
    const categories = [
            'All',
            'Infrastructure & Transportation',
            'Monumental & Defensive Structures',
            'Water & Resource Management',
            'Energy & Communication',
            'Industrial & Technological Innovation'
        ];

    // get the selected category using categoryIndex on
    // categories array
    const selectedCategory = categories[categoryIndex];

    // for each feature in the geojson array, do this:
    geojson.features.forEach( function (point, index) {
        // get the point's category for a comparison
        let pointCategory = point.properties.category;

        /*
            check if the selected category is 'all', 
            otherwise, check if point category is the
            same as selected category
        */
        if(selectedCategory === 'All' || 
            pointCategory === selectedCategory) {

            /*
                make a new 50px by 50px point element
                give it a goldenrod yellow background
                make sure items are centered
            */
            const size = 50;
            const item = document.createElement('div');

            item.className = 'point';
            item.style.width = `${size}px`;
            item.style.height = `${size}px`;
            item.style.background = "#ffbf00";
            item.style.alignContent = "center";
            item.style.justifyContent = "center";

            item.dataset.sidebarId = `sidebar-entry-${index}`;

            /*
                create image element centered in the point
                and assign it the point's image with alt 
                of point's category
                make sure the image is centered using 
                margins and fits in the marker
            */
            const img = document.createElement('img');
            img.src = point.properties.image;
            img.alt = point.properties.category;
            img.style.width = "80%";
            img.style.height = "80%";
            img.style.marginLeft = "auto";
            img.style.marginRight = "auto";

            // append image to the point
            item.appendChild(img);

            // create new mapbox point
            const newPoint = new mapboxgl.Marker({
                // give the point an element
                element: item,
                // lock rotation to face the viewport when visible
                rotationAlignment: 'viewport',
                // offset the point by -1/2 of its size
                offset: [0, -size / 2]
            }).setLngLat(point.geometry.coordinates).addTo(map);

            /* add click event listener for flyTo animation */

            item.addEventListener("click", function() {
                // populate sidebar
                populateSidebarWithContent(point.properties.category);

                // when point clicked, set timeout to avoid animation competition.
                setTimeout(() => {
                    const sidebarEntry = document.getElementById(item.dataset.sidebarId);
                    if (sidebarEntry) {
                        sidebarEntry.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, HALF_SECOND); // Delay scrolling slightly to avoid competing animations

                // stop spin if spinning
                if(spinEnabled == true) startStopSpin();

                // flyTo the relevant point
                map.flyTo({
                    center: point.geometry.coordinates,
                    zoom: MAX_ZOOM
                });

            });

            // add new point to list of current points
            currentPoints.push(newPoint);

        }

    });
}

function showCategoryMenu() {
    // move menu outside field of vision
    categoryMenu.style.left = "0";
}

// hideCategoryMenu function
function hideCategoryMenu() {
    // move menu outside field of vision
    categoryMenu.style.left = "-20%";
}

// function to close the sidebar element
function closeSidebar() {
    // get the sidebar element
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.querySelector('#closeSidebar');
    // Make sure this matches the width of the sidebar
    sidebar.style.right = '-40%';
    // remove close button
    closeSidebar.style.display = "none";
    remove(closeSidebar);
}

// function to populate sidebar with resource content
function populateSidebarWithResources() {
    // get sidebar element
    const sidebar = document.querySelector("#sidebar");
    // clear sidebar element
    sidebar.innerHTML = "";
    // make new element
    const content = document.createElement("div");
    content.className = 'sidebar-entry';
    content.innerHTML = `<div>
            <h1>Author</h1>
            <p>Conner Batson<p>
        </div>
        <div>
            <h1>Last Update</h1>
            <p>${LAST_UPDATE}</p> 
        </div>
        <div>
            <h1>AI Use</h1>
            <p>The author has consulted generative ai for the following subjects:</p>
            <ul>
                <li>Collecting fact-checked data on subjects related to listed engineering projects</li>
                <li>Formatting data into specific json used for interacting with mapbox api</li>
                <li>Analyzing different color styles used in the map project</li>
                <li>Consulting various types of fonts and font combinations that may or may not be used in the map project</li>
            </ul>
        </div>
        <div id="resource-links">
            <h1>Resources</h1>
            <ul>
                <li><a href="https://www.flaticon.com/free-icons/transport" title="transport icons">Transport icons created by geotatah - Flaticon</a></li>
                <li><a href="https://www.flaticon.com/free-icons/brick" title="brick icons">Brick icons created by Smashicons - Flaticon</a></li>
                <li><a href="https://www.flaticon.com/free-icons/natural-resources" title="natural resources icons">Natural resources icons created by Uniconlabs - Flaticon</a></li>
                <li><a href="https://www.flaticon.com/free-icons/solar-panel" title="solar panel icons">Solar panel icons created by wanicon - Flaticon</a></li>
                <li><a href="https://www.flaticon.com/free-icons/eletronics" title="eletronics icons">Eletronics icons created by wanicon - Flaticon</a></li>
                <li>By <a href="//commons.wikimedia.org/wiki/File:Three_Gorges_Dam,_Yangtze_River,_China.jpg" title="File:Three Gorges Dam, Yangtze River, China.jpg">Source file</a>: <a rel="nofollow" class="external text" href="https://www.flickr.com/people/44048265@N00">Le Grand Portage</a>Derivative work: <a href="//commons.wikimedia.org/wiki/User:Rehman" title="User:Rehman">Rehman</a> - <a href="//commons.wikimedia.org/wiki/File:Three_Gorges_Dam,_Yangtze_River,_China.jpg" title="File:Three Gorges Dam, Yangtze River, China.jpg">File:Three Gorges Dam, Yangtze River, China (jpg)</a>, <a href="https://creativecommons.org/licenses/by/2.0" title="Creative Commons Attribution 2.0">CC BY 2.0</a>, <a href="https://commons.wikimedia.org/w/index.php?curid=11425004">Link</a></li>
                <li><a href="https://www.amusingplanet.com/2023/11/sadd-el-kafara-oldest-dam-in-world.html">sadd-el-kafara</a></li>
                <li><a href="https://www.history.com/topics/great-depression/hoover-dam">History - Hover Dam</a></li>
                <li>By <a href="//commons.wikimedia.org/wiki/User:Benh" title="User:Benh">Benh LIEU SONG</a> (<a rel="nofollow" class="external text" href="https://www.flickr.com/people/75729488@N03">Flickr</a>) - <a rel="nofollow" class="external text" href="https://www.flickr.com/photos/blieusong/27217216147/">Pont du Gard</a>, <a href="https://creativecommons.org/licenses/by-sa/3.0" title="Creative Commons Attribution-Share Alike 3.0">CC BY-SA 3.0</a>, <a href="https://commons.wikimedia.org/w/index.php?curid=33474941">Link</a></li>
                <li>By <a href="//commons.wikimedia.org/wiki/User:EditQ" class="mw-redirect" title="User:EditQ">EditQ</a> - <span class="int-own-work" lang="en">Own work</span>, <a href="https://creativecommons.org/licenses/by-sa/4.0" title="Creative Commons Attribution-Share Alike 4.0">CC BY-SA 4.0</a>, <a href="https://commons.wikimedia.org/w/index.php?curid=136061119">Link</a></li>
                <li>By <a href="//commons.wikimedia.org/wiki/User:Danmichaelo" title="User:Danmichaelo">Danmichaelo</a> - This W3C-unspecified <a href="https://en.wikipedia.org/wiki/Vector_images" class="extiw" title="w:Vector images">vector image</a> was created with <a href="https://en.wikipedia.org/wiki/Inkscape" class="extiw" title="w:Inkscape">Inkscape</a> ., <a href="https://creativecommons.org/licenses/by-sa/3.0" title="Creative Commons Attribution-Share Alike 3.0">CC BY-SA 3.0</a>, <a href="https://commons.wikimedia.org/w/index.php?curid=17094060">Link</a></li>
                <li><a href="https://en.wikipedia.org/wiki/Maginot_Line"></a>The Maginot Line</li>
                <li>By <a href="//commons.wikimedia.org/wiki/File:Hadrians_Wall_map.png" title="File:Hadrians Wall map.png">Hadrians_Wall_map.png</a>: Created by NormanEinstein, September 20, 2005derivative work: <a href="//commons.wikimedia.org/wiki/User:Talifero" title="User:Talifero">Talifero</a> (<a href="//commons.wikimedia.org/wiki/User_talk:Talifero" title="User talk:Talifero"><span class="signature-talk">talk</span></a>) - <a href="//commons.wikimedia.org/wiki/File:Hadrians_Wall_map.png" title="File:Hadrians Wall map.png">Hadrians_Wall_map.png</a>, <a href="http://creativecommons.org/licenses/by-sa/3.0/" title="Creative Commons Attribution-Share Alike 3.0">CC BY-SA 3.0</a>, <a href="https://commons.wikimedia.org/w/index.php?curid=15121382">Link</a></li>
                <li>By Severin.stalder, <a href="https://creativecommons.org/licenses/by-sa/3.0" title="Creative Commons Attribution-Share Alike 3.0">CC BY-SA 3.0</a>, <a href="https://commons.wikimedia.org/w/index.php?curid=39661035">Link</a></li>
                <li>By <a href="//commons.wikimedia.org/wiki/User:Billy69150" title="User:Billy69150">Billy69150</a> (voir les <a href="#Conditions_d'utilisation">conditions d'utilisation</a> / see <a href="#Licensing">licensing</a> below) - <span class="int-own-work" lang="en">Own work</span>, <a href="https://creativecommons.org/licenses/by-sa/4.0" title="Creative Commons Attribution-Share Alike 4.0">CC BY-SA 4.0</a>, <a href="https://commons.wikimedia.org/w/index.php?curid=37178883">Link</a></li>
                <li>By <a href="//commons.wikimedia.org/w/index.php?title=User:LuisaV72&amp;action=edit&amp;redlink=1" class="new" title="User:LuisaV72 (page does not exist)">LuisaV72</a> - <span class="int-own-work" lang="en">Own work</span>, <a href="https://creativecommons.org/licenses/by-sa/4.0" title="Creative Commons Attribution-Share Alike 4.0">CC BY-SA 4.0</a>, <a href="https://commons.wikimedia.org/w/index.php?curid=134221328">Link</a></li>
                <li>By Thomas Römer/OpenStreetMap data, <a href="https://creativecommons.org/licenses/by-sa/2.0" title="Creative Commons Attribution-Share Alike 2.0">CC BY-SA 2.0</a>, <a href="https://commons.wikimedia.org/w/index.php?curid=19678675">Link</a></li>
                <li><a href="https://www.transsiberianexpress.net/train-info/history-of-the-trans-siberian-railway">History of the Trans-Siberian Railway</a></li>
            </ul>
        </div>`;
        sidebar.appendChild(content);

    // Adjustments for sidebar and reset button visibility
    sidebar.style.right = '0';
    const resetButton = document.getElementById('resetMap');
    resetButton.style.display = 'block';

    // Add close button after adding entries
    const closeButton = document.createElement('button');
    closeButton.setAttribute('id', 'closeSidebar');
    closeButton.setAttribute('title', 'Close');
    closeButton.innerHTML = '&#x2715;';
    // Prepend button after 0.5s to make it appear 
    // at the top of the sidebar
    setTimeout(function () {
        sidebar.prepend(closeButton);
        }, HALF_SECOND);

    // Now attach the click event listener to the Close button
    closeButton.addEventListener('click', closeSidebar);

    // close hamburger menu
    closeMenuOnLeave(HALF_SECOND);
}

// function to populate sidebar with category content
function populateSidebarWithContent(category) {
    // get the sidebar element
    const sidebar = document.querySelector("#sidebar");
    // clear sidebar content before populating
    sidebar.innerHTML = "";

    geojson.features.forEach((feature, index) => {
        // check if feature is in category
        if (feature.properties.category === category) {
            // make a new div element
            const content = document.createElement("div");
            // add class to div elem
            content.className = 'sidebar-entry';
            // assign id to each entry
            content.id = `sidebar-entry-${index}`;
            // create the inner html to be added
            content.innerHTML = `<h1>${feature.properties.name}</h1>
            <img src="${feature.properties.picture}" alt="${feature.properties.description}"></img>
            <p>${feature.properties.content}</p>`;
            // add the element to the sidebar
            sidebar.appendChild(content);

            // click event to center map on each feature
            content.addEventListener('click', function () {
                map.flyTo({
                    center: feature.geometry.coordinates,
                    essential: true,
                    zoom: MAX_ZOOM
                });
            });
        }
    });

    // Adjustments for sidebar and reset button visibility
    sidebar.style.right = '0';
    const resetButton = document.getElementById('resetMap');
    resetButton.style.display = 'block';

    // Add close button after adding entries
    const closeButton = document.createElement('button');
    closeButton.setAttribute('id', 'closeSidebar');
    closeButton.setAttribute('title', 'Close');
    closeButton.innerHTML = '&#x2715;';
    // Prepend button after 0.5s to make it appear 
    // at the top of the sidebar
    setTimeout(function () {
        sidebar.prepend(closeButton);
        }, HALF_SECOND);

    // Now attach the click event listener to the Close button
    closeButton.addEventListener('click', closeSidebar);
}

// function to stop/start globe spin
function spinGlobe() {
    const zoom = map.getZoom();
    if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
        let distancePerSecond = 360 / secondsPerRevolution;
        if (zoom > slowSpinZoom) {
            // Slow spinning at higher zooms
            const zoomDif =
                (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
            distancePerSecond *= zoomDif;
        }
        const center = map.getCenter();
        center.lng += distancePerSecond;
        // Smoothly animate the map over one second.
        // When this animation is complete, it calls a 'moveend' event.
        map.easeTo({ center, duration: 1000, easing: (n) => n });
    }
}

// Pause spinning on interaction
map.on('mousedown', () => {
    userInteracting = true;
});

// Restart spinning the globe when interaction is complete
map.on('mouseup', () => {
    userInteracting = false;
    spinGlobe();
});

// These events account for cases where the mouse has moved
// off the map, so 'mouseup' will not be fired.
map.on('dragend', () => {
    userInteracting = false;
    spinGlobe();
});
map.on('pitchend', () => {
    userInteracting = false;
    spinGlobe();
});
map.on('rotateend', () => {
    userInteracting = false;
    spinGlobe();
});

// When animation is complete, start spinning if there is no ongoing interaction
map.on('moveend', () => {
    spinGlobe();
});

// Loop through each tab and add event listeners
for (let i = 0; i < tabs.length; i++) {
  let tab = tabs[i];
  let textElement = texts[i];

  // Mouse enter event
  tab.addEventListener('mouseenter', function() {
    textElement.classList.remove('inactive-text');
    textElement.classList.add('active-text');
  });
  
  // Mouse leave event
  tab.addEventListener('mouseleave', function() {
    if(!tab.classList.contains('clicked-tab')) {
      textElement.classList.remove('active-text');
      textElement.classList.add('inactive-text');
    }
  });

  // Click event
  tab.addEventListener('click', function(event) {
    let currentTab = event.target;
    // console.log(currentTab);
    console.log(tabs);
    //Remove active class from all tabs
    for (var j = 0; j < tabs.length; j++){
        tabs[j].classList.remove("active-tab");
        tabs[j].nextElementSibling.classList.remove('active-text');
        tabs[j].nextElementSibling.classList.add('inactive-text');
    }

    // Add active class to clicked tab
    tab.classList.add('clicked-tab');
    textElement.classList.remove('inactive-text');
    textElement.classList.add('active-text');

    // set timeout to remove active class

    setTimeout(function() {
        tab.classList.remove('clicked-tab');
        tab.classList.add('active-tab');

        for (var j = 0; j < tabs.length; j++){
            if (currentTab !== tabs[j]) {
                tabs[j].classList.remove("active-tab");
            }
        }
    }, HALF_SECOND);

    // Set timeout to hide text
    setTimeout(function() {
        textElement.classList.remove('active-text');
        textElement.classList.add('inactive-text');

        // close menu when done
        closeMenuOnLeave(HALF_SECOND);
    }, FOUR_SECOND);

  });
}

/*
    >>> Event Listeners <<<
*/
hamburgerMenuButton.addEventListener('click', function() {
    if (hamburgerToggleControl === false) {
        // set control
        menuControlOn();

        hamburgerToggle = !hamburgerToggle;
        hamburgerSwitch(hamburgerMenu, hamburgerToggle);

        // unset control
        menuControlOff();
    }
});

categoryMenu.addEventListener("mouseleave", () => {
    if (hamburgerToggleControl === false) {
        // set control
        menuControlOn();

        closeMenuOnLeave(FOUR_SECOND);

        // unset control
        menuControlOff();
    }
});

// apply event listeners to category items
document.querySelectorAll('.category-item').forEach(item => {
    // for each item, add event listener
    item.addEventListener('click', function() {
        // set control
        menuControlOn();

        // get index
        const selectedCategory = this.getAttribute('data-category');

        // load relevant points
        getCategoryPoints(selectedCategory);

        // unset control
        menuControlOff();
    });
});

// credit button event listener
creditButton.addEventListener('click', () => {
    // call populate with resources function
    populateSidebarWithResources();
});

// reset button event listener
resetButton.addEventListener('click', () => {
    // reset map to initial state using flyTo animation
    map.flyTo(initialMapState);
    closeMenuOnLeave(HALF_SECOND);
});

function startStopSpin() {
    spinEnabled = !spinEnabled;

    if (spinEnabled) {
        spinGlobe();

        playPauseButton.classList.remove("play-symbol");
        playPauseButton.classList.add("pause-symbol");
    } else {
        map.stop();

        playPauseButton.classList.remove("pause-symbol");
        playPauseButton.classList.add("play-symbol");
    }
}

playPauseButton.addEventListener('click', startStopSpin);

/*
	Constant for the features on the map,
	structured in GeoJSON format.
*/
const geojson = {
	'type': 'FeatureCollection',
	'features': [

		// Infrastructure & Transportation
		{
            "type": "Feature",
            "properties": {
                "name": "The Trans-Siberian Railway",
                "description": "The Trans-Siberian Railway is a network of railways connecting Moscow with the Russian Far East. With a length of 9,289 kilometres (5,772 miles), it is the longest railway line in the world.",
                "category": "Infrastructure & Transportation",
                "content": "The Trans-Siberian Railway's construction, spanning from 1891 to 1916, was a monumental undertaking that transformed Russia. It drastically reduced travel times across the vast country, facilitating trade, resource extraction, and settlement in Siberia. The railway's impact extended beyond Russia's borders, connecting Europe to East Asia and influencing global trade patterns. Its construction involved overcoming extreme weather conditions and challenging terrain, showcasing the engineering prowess of the era.",
                "image": "images/transportation.png",
                "picture": "images/transSiberianRailway.jpg"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [90.0000, 60.0000]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "The Panama Canal",
                "description": "The Panama Canal is a 82 km (51 mi) waterway in Panama that connects the Atlantic Ocean with the Pacific Ocean. The canal cuts across the Isthmus of Panama and is a key conduit for international maritime trade.",
                "category": "Infrastructure & Transportation",
                "content": "The Panama Canal, completed in 1914, revolutionized maritime trade by eliminating the need for ships to navigate around South America. Its construction, marked by engineering challenges and health hazards, significantly shortened travel times between the Atlantic and Pacific Oceans. The canal's strategic importance has made it a vital artery for global commerce, impacting international relations and economic development.",
                "image": "images/transportation.png",
                "picture": "images/panamaCanal.png"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-79.8239, 8.8741]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "The Appian Way",
                "description": "The Appian Way is one of the earliest and strategically most important Roman roads of the ancient republic. It connected Rome to Brindisi, in southeast Italy.",
                "category": "Infrastructure & Transportation",
                "content": "The Appian Way, constructed in 312 BC, was a strategic Roman road that connected Rome to southern Italy. Its construction facilitated military movement, trade, and communication, contributing to the expansion and consolidation of the Roman Republic. The road's durability and engineering excellence are testaments to Roman infrastructure, influencing road construction for centuries.",
                "image": "images/transportation.png",
                "picture": "images/nationalParkNearAppianWay.jpg"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [12.4964, 41.9028]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "The Channel Tunnel (Chunnel)",
                "description": "The Channel Tunnel, also known as the Chunnel, is a 50.45-kilometre (31.35 mi) railway tunnel beneath the English Channel at the Strait of Dover, connecting Folkestone, Kent, in England, with Coquelles, Pas-de-Calais, in northern France.",
                "category": "Infrastructure & Transportation",
                "content": "The Channel Tunnel, opened in 1994, is a marvel of modern engineering, providing a direct rail link between England and France. Its construction, overcoming geological challenges beneath the English Channel, significantly reduced travel times and fostered closer ties between the two nations. The tunnel's impact on trade and tourism has been profound, symbolizing European integration.",
                "image": "images/transportation.png",
                "picture": "images/tvgAtChannelTunnel.jpg"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [1.3851, 51.1042]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "The Golden Gate Bridge",
                "description": "The Golden Gate Bridge is a suspension bridge spanning the Golden Gate, the one-mile-wide (1.6 km) strait connecting San Francisco Bay and the Pacific Ocean. It is a symbol of San Francisco, California, and the United States.",
                "category": "Infrastructure & Transportation",
                "content": "The Golden Gate Bridge, completed in 1937, is an iconic symbol of San Francisco and a testament to engineering ingenuity. Its construction, amidst challenging weather conditions and strong tides, connected San Francisco to Marin County, fostering economic growth and regional development. The bridge's architectural beauty and engineering feat have made it a world-renowned landmark.",
                "image": "images/transportation.png",
                "picture": "images/goldenGateBridge.jpg"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-122.4783, 37.8199]
            }
        },

        // Monumental & Defensive Structures
        {
            "type": "Feature",
            "properties": {
                "name": "The Great Wall of China",
                "description": "The Great Wall of China is a series of fortifications made of stone and brick, generally built along an east-to-west line across the historical northern borders of China to protect the Chinese state against intrusions by various nomadic groups or military incursions.",
                "category": "Monumental & Defensive Structures",
                "content": "The Great Wall of China, built over centuries, stands as a testament to China's defensive strategies and engineering capabilities. Its construction, involving millions of laborers and spanning multiple dynasties, aimed to protect China's northern borders from invasions. The wall's immense scale and historical significance have made it a symbol of China's resilience and cultural heritage.",
                "image": "images/brickwall.png",
                "picture": "images/greatWallOfChina.jpg"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [117.0000, 40.0000]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Hadrian's Wall",
                "description": "Hadrian's Wall was a defensive fortification in Roman Britain, begun in AD 122, following the visit of emperor Hadrian. It ran from the banks of the River Tyne near the North Sea to the Solway Firth on the Irish Sea, and formed the northernmost frontier of the Roman Empire.",
                "category": "Monumental & Defensive Structures",
                "content": "Hadrian's Wall, built by the Roman Empire in the 2nd century AD, marked the northern frontier of Roman Britain. Its construction, aimed to control movement and defend against Pictish raids, showcased Roman engineering and organizational skills. The wall's remnants serve as a historical landmark, providing insights into Roman military architecture and frontier life.",
                "image": "images/brickwall.png",
                "picture": "images/hadriansWall.png"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-2.5934, 55.0076]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Maginot Line",
                "description": "The Maginot Line was a line of concrete fortifications, obstacles, and weapon installations built by France in the 1930s to deter invasion by Germany and force them to attack around the fortifications.",
                "category": "Monumental & Defensive Structures",
                "content": "The Maginot Line, constructed by France in the 1930s, was a defensive fortification intended to deter German aggression. Its design, emphasizing static defenses and concrete fortifications, reflected the military strategies of the era. The line's failure to prevent the German invasion in World War II highlighted the limitations of static defenses in modern warfare.",
                "image": "images/brickwall.png",
                "picture": "images/maginotLine.jpg"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [5.1789, 49.3871]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "The Pyramids of Giza",
                "description": "The Giza pyramid complex, also called the Giza Necropolis, is an archaeological site on the Giza Plateau, on the outskirts of Cairo, Egypt. This complex of ancient monuments includes the Great Pyramid of Giza, the Pyramid of Khafre, and the Pyramid of Menkaure, along with their associated pyramid complexes and the Great Sphinx of Giza.",
                "category": "Monumental & Defensive Structures",
                "content": "The Pyramids of Giza, built during Egypt's Old Kingdom, are architectural marvels and symbols of ancient Egyptian civilization. Their construction, involving complex logistics and engineering techniques, served as tombs for pharaohs. The pyramids' enduring presence and historical significance have captivated scholars and visitors for millennia.",
                "image": "images/brickwall.png",
                "picture": "images/pyramidsGiza.jpg"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [31.1313, 29.9765]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "The Colosseum",
                "description": "The Colosseum or Coliseum, also known as the Flavian Amphitheatre, is an oval amphitheatre in the centre of the city of Rome, Italy. Built of travertine limestone, tuff, and brick-faced concrete, it was the largest amphitheatre built at the time and could hold an estimated 50,000 to 80,000 spectators.",
                "category": "Monumental & Defensive Structures",
                "content": "The Colosseum, built in ancient Rome, was an amphitheater used for public spectacles and gladiatorial contests. Its construction, showcasing Roman engineering and architectural skills, provided entertainment for thousands of spectators. The Colosseum's ruins serve as a historical landmark, offering insights into Roman society and entertainment.",
                "image": "images/brickwall.png",
                "picture": "images/colosseum.jpg"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [12.4922, 41.8902]
            }
        },

        // Water & Resource Management
        {
            "type": "Feature",
            "properties": {
                "name": "The Great Man-Made River",
                "description": "The Great Man-Made River is a network of pipes that supplies fresh water to the Sahara Desert in Libya, from the Nubian Sandstone Aquifer System. It is the world's largest irrigation project.",
                "category": "Water & Resource Management",
                "content": "The Great Man-Made River, a vast network of pipes in Libya, supplies fresh water to arid regions. Its construction, aimed to address water scarcity, showcases ambitious engineering and resource management. The project's impact on agriculture and settlement has been significant, though it has also raised environmental concerns.",
                "image": "images/natural-resources.png",
                "picture": "images/greatManMadeRiver.png"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [21.0000, 28.0000]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Roman Aqueducts",
                "description": "Roman aqueducts were built to bring water from distant sources into cities and towns, supplying public baths, latrines, fountains, and private households. They were built throughout the Roman Empire.",
                "category": "Water & Resource Management",
                "content": "Roman aqueducts, built throughout the Roman Empire, transported water to cities and towns. Their construction, involving precise engineering and surveying, provided essential water supplies for public baths, fountains, and households. The aqueducts' remnants are testaments to Roman engineering and infrastructure.",
                "image": "images/natural-resources.png",
                "picture": "images/romanAqueducts.jpg"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [12.4964, 41.9028]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "The Grand Canal of China",
                "description": "The Grand Canal, also known as the Beijing-Hangzhou Grand Canal, is the longest canal or artificial river in the world.",
                "category": "Water & Resource Management",
                "content": "Starting in Beijing, the Grand Canal passes through Tianjin and the provinces of Hebei, Shandong, Jiangsu, and Zhejiang to the city of Hangzhou, linking the Yellow River and Yangtze River. Connecting major Chinese rivers, the canal has served as a vital transportation and irrigation artery for centuries. Its construction, spanning multiple dynasties, facilitated trade and agricultural development. The canal's length and historical significance have made it a symbol of China's engineering achievements and economic importance.",
                "image": "images/natural-resources.png",
                "picture": "images/grandCanalChina.jpg"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [116.4074, 39.9042]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Hoover Dam",
                "description": "The Hoover Dam, formerly known as Boulder Dam, is a concrete arch-gravity dam in the Black Canyon of the Colorado River, on the border between the U.S. states of Nevada and Arizona. It impounds Lake Mead, the largest reservoir in the U.S. by volume.",
                "category": "Water & Resource Management",
                "content": "The Hoover Dam, built on the Colorado River, provides hydroelectric power and water for irrigation. Its construction, amidst the Great Depression, was a massive engineering undertaking that created Lake Mead. The dam's impact on regional development and water management has been profound.",
                "image": "images/natural-resources.png",
                "picture": "images/hoover.jpg"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-114.7372, 36.0157]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Sadd el-Kafara",
                "description": "Sadd el-Kafara, the oldest known large dam, was built in ancient Egypt.",
                "category": "Water & Resource Management",
                "content": "Sadd el-Kafara, meaning 'Dam of the Pagans' in Arabic, is the oldest known large dam construction in history, located in Wadi Al-Garawi, about 30 km (19 mi) south of Cairo, Egypt. The dam was built during the third dynasty (2686–2613 BC). Its construction, aimed to control flooding and store water, showcases early engineering and resource management. The dam's remnants provide insights into ancient Egyptian water management practices.",
                "image": "images/natural-resources.png",
                "picture": "images/sadd-el-kafara.jpg"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [31.3414, 29.8665]
            }
        },

        // Energy & Communication
        {
            "type": "Feature",
            "properties": {
                "name": "Three Gorges Dam",
                "description": "The Three Gorges Dam, built on the Yangtze River, is the world's largest hydroelectric power station.",
                "category": "Energy & Communication",
                "content": "The Three Gorges Dam is a hydroelectric gravity dam that spans the Yangtze River by the town of Sandouping, in Yiling District, Yichang, Hubei province, China. The Three Gorges Dam is the world's largest power station in terms of installed capacity (22,500 MW). Its construction, aimed to control flooding and generate electricity, has had significant environmental and social impacts. The dam's scale and engineering complexity have made it a landmark of modern engineering.",
                "image": "images/smart-house.png",
                "picture": "images/threeGorgesDam.jpg"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [111.0025, 30.8281]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "First Hydroelectric Power Plant (Cragside)",
                "description": "Cragside, the first house lit by hydroelectric power, marked a milestone in the use of renewable energy.",
                "category": "Energy & Communication",
                "content": "Cragside, in Northumberland, England, was the first house in the world to be lit by hydroelectric power. Using dams on the estate to generate power, its pioneering use of hydroelectricity showcased the potential of alternative energy sources. Cragside's innovative energy system influenced the development of hydroelectric power.",
                "image": "images/smart-house.png",
                "picture": "images/cragsideHydroelectric.jpg"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-1.9566, 55.3055]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Nuclear Power Plants (Various)",
                "description": "Nuclear power plants, using nuclear fission, generate electricity.",
                "category": "Energy & Communication",
                "content": "Nuclear power plants use the heat generated by nuclear fission in a controlled nuclear reaction to heat water to produce steam, which drives a steam turbine connected to an electrical generator that produces electricity. Their development, aimed to provide alternative energy sources, has raised concerns about safety and waste disposal. Nuclear power's role in the global energy mix continues to be debated.",
                "image": "images/smart-house.png",
                "picture": "images/nuclearPower.jpg"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-112.9836, 43.5015]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "The Telegraph System",
                "description": "The telegraph system, using electrical signals, revolutionized long-distance communication.",
                "category": "Energy & Communication",
                "content": "The telegraph is a long-distance transmission of textual or symbolic messages. The telegraph required a coded language, such as Morse code, to translate messages. Its development, enabling rapid message transmission, transformed business, journalism, and personal communication. The telegraph's impact on communication infrastructure has been profound.",
                "image": "images/smart-house.png",
                "picture": "images/theTelegraph.jpg"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-77.0364, 38.8951]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "The Internet",
                "description": "The Internet, a global network of computers, has transformed communication, commerce, and information sharing.",
                "category": "Energy & Communication",
                "content": "The Internet is the global system of interconnected computer networks that uses the Internet protocol suite (TCP/IP) to communicate between networks and devices. Its development, originating from military and academic research, has created a global information society. The Internet's impact on society continues to evolve.",
                "image": "images/smart-house.png",
                "picture": "images/theInternet.jpg"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-122.1430, 37.4220]
            }
        },

        // Industrial and Technological Innovation
        {
            "type": "Feature",
            "properties": {
                "name": "The Spinning Jenny",
                "description": "The spinning jenny, a multi-spindle spinning frame, revolutionized textile manufacturing.",
                "category": "Industrial & Technological Innovation",
                "content": "The spinning jenny is a multi-spindle spinning frame, and was one of the key developments in the industrialization of textile manufacturing during the early Industrial Revolution. Its invention, during the Industrial Revolution, increased productivity and efficiency in yarn production. The spinning jenny's impact on textile technology was transformative.",
                "image": "images/technical.png",
                "picture": "images/spinningJenny.jpg"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-1.4700, 53.8000]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "The Assembly Line (Ford)",
                "description": "The assembly line, pioneered by Henry Ford, transformed manufacturing processes.",
                "category": "Industrial & Technological Innovation",
                "content": "The assembly line is a manufacturing process in which parts are added as the semi-finished assembly moves from workstation to workstation where the parts are added in sequence until the final assembly is produced. Henry Ford and his engineers are credited with the first moving assembly line. Its implementation, enabling mass production of automobiles, reduced costs and increased efficiency. The assembly line's impact on industrial production has been profound.",
                "image": "images/technical.png",
                "picture": "images/assemblyLine.jpg"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-83.0458, 42.3314]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "The Bessemer Process (Steel)",
                "description": "The Bessemer process, enabling mass production of steel, revolutionized the steel industry.",
                "category": "Industrial & Technological Innovation",
                "content": "The Bessemer process was the first inexpensive industrial process for the mass-production of steel from molten pig iron before the development of the open-hearth furnace. The key principle is removal of impurities from the iron by oxidation with air being blown through the molten iron. Its invention, reducing the cost of steel production, facilitated the construction of railroads, bridges, and buildings. The Bessemer process's impact on infrastructure development was transformative.",
                "image": "images/technical.png",
                "picture": "images/bessemerProcess.jpg"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-1.4700, 52.5800]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "The Wright Flyer",
                "description": "The Wright Flyer, making the first sustained flight, marked a milestone in aviation history.",
                "category": "Industrial & Technological Innovation",
                "content": "The Wright Flyer made the first sustained, controlled flight of a powered heavier-than-air aircraft with a pilot aboard. It was designed and built by the Wright brothers. Its design, incorporating aerodynamic principles, paved the way for modern aviation. The Wright Flyer's impact on transportation and technology has been profound.",
                "image": "images/technical.png",
                "picture": "images/wrightFlyer.jpg"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-75.8458, 36.0020]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Apollo 11 (Moon Landing)",
                "description": "Apollo 11, landing humans on the Moon, was a monumental achievement in space exploration.",
                "category": "Industrial & Technological Innovation",
                "content": "Apollo 11 was the American spaceflight that first landed humans on the Moon. Commander Neil Armstrong and lunar module pilot Buzz Aldrin landed the Apollo Lunar Module Eagle on July 20, 1969. Its success, showcasing technological innovation and human endeavor, symbolized human potential. Apollo 11's impact on space exploration and scientific advancement has been transformative.",
                "image": "images/technical.png",
                "picture": "images/apollo11.jpg"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-80.6041, 28.6083]
            }
        }
	]
}

// start globe spinning and show all points

spinGlobe();
getCategoryPoints("0");

// 