/* =========================================================
   INDIA INTERACTIVE HISTORICAL MAP
   script.js
   ========================================================= */

let places = [];
let selectedPlace = null;

let scale = 1;
let translateX = 0;
let translateY = 0;


/* =========================================================
   HTML ELEMENTS
   ========================================================= */

const placeList =
    document.getElementById("placeList");

const searchBox =
    document.getElementById("searchBox");

const mapContainer =
    document.getElementById("mapContainer");

const mapObject =
    document.getElementById("indiaMap");

const marker =
    document.getElementById("marker");

const popup =
    document.getElementById("popup");

const popupTitle =
    document.getElementById("popupTitle");

const popupInfo =
    document.getElementById("popupInfo");

const closePopup =
    document.getElementById("closePopup");

const zoomInBtn =
    document.getElementById("zoomIn");

const zoomOutBtn =
    document.getElementById("zoomOut");

const resetBtn =
    document.getElementById("resetMap");

const showAllBtn =
    document.getElementById("showAll");


/* =========================================================
   SVG ORIGINAL SIZE
   ========================================================= */

const SVG_WIDTH = 2200;
const SVG_HEIGHT = 2500;


/* =========================================================
   LOAD PLACES.JSON
   ========================================================= */

async function loadPlaces() {

    try {

        const response =
            await fetch("./places.json");

        if (!response.ok) {

            throw new Error(
                "HTTP Error: " +
                response.status
            );

        }

        places =
            await response.json();

        console.log(
            "SUCCESS:",
            places.length,
            "places loaded"
        );

        renderPlaceList(places);

    }

    catch (error) {

        console.error(
            "PLACES ERROR:",
            error
        );

        placeList.innerHTML = `
            <li style="color:red;">
                places.json Load ஆகவில்லை
            </li>
        `;

    }

}


/* =========================================================
   RENDER PLACE LIST
   ========================================================= */

function renderPlaceList(list) {

    placeList.innerHTML = "";

    list.forEach(place => {

        const li =
            document.createElement("li");

        li.textContent =
            place.name +
            " – " +
            place.current;

        li.dataset.id =
            place.id;


        li.addEventListener(
            "click",
            function () {

                document
                    .querySelectorAll(
                        "#placeList li"
                    )
                    .forEach(item => {

                        item.classList.remove(
                            "active"
                        );

                    });


                li.classList.add("active");


               selectedPlace = place;
showPlace(place);

            }
        );


        placeList.appendChild(li);

    });

}


/* =========================================================
   SEARCH
   ========================================================= */

if (searchBox) {

    searchBox.addEventListener(
        "input",
        function () {

            const text =
                searchBox.value
                    .toLowerCase()
                    .trim();


            const filtered =
                places.filter(place => {

                    return (

                        String(place.name || "")
                            .toLowerCase()
                            .includes(text)

                        ||

                        String(place.current || "")
                            .toLowerCase()
                            .includes(text)

                        ||

                        String(place.state || "")
                            .toLowerCase()
                            .includes(text)

                    );

                });


            renderPlaceList(filtered);

        }
    );

}


/* =========================================================
   SHOW PLACE
   ========================================================= */

function showPlace(place) {

    selectedPlace = place;

    console.log("Selected place:", place.name);

    // முதலில் marker-ஐ சரியான இடத்தில் அமைக்கவும்
    updateMarker();

    // Popup-ஐ காட்டவும்
    showPopup();

}


/* =========================================================
   UPDATE MARKER
   ========================================================= */

function updateMarker() {

    if (!selectedPlace) {
        marker.style.display = "none";
        return;
    }

    /*
       SVG element-ன் உண்மையான displayed rectangle
    */
    const rect = mapObject.getBoundingClientRect();

    const containerRect =
        mapContainer.getBoundingClientRect();

    /*
       SVG original coordinate → screen coordinate
    */

    const scaleX =
        rect.width / SVG_WIDTH;

    const scaleY =
        rect.height / SVG_HEIGHT;


    /*
       Marker position inside SVG
    */

    const x =
        selectedPlace.x * scaleX;

    const y =
        selectedPlace.y * scaleY;


    /*
       SVG-ன் container-க்கு உள்ள relative position
    */

    const left =
        (rect.left - containerRect.left) + x;

    const top =
        (rect.top - containerRect.top) + y;


    /*
       Marker
    */

    marker.style.display = "block";

    marker.style.left =
        left + "px";

    marker.style.top =
        top + "px";

    marker.style.background =
        selectedPlace.color || "red";

    marker.style.boxShadow =
        "0 0 0 4px rgba(255,255,255,0.8), " +
        "0 0 18px " +
        (selectedPlace.color || "red");


    /*
       Popup position
    */

    marker.dataset.left = left;
    marker.dataset.top = top;

}


/* =========================================================
   POPUP
   ========================================================= */

function showPopup() {

    if (!selectedPlace) {
        return;
    }


    popup.style.display =
        "block";


    popupTitle.textContent =
        selectedPlace.name;


    popupInfo.innerHTML = `

        <b>Current Name</b><br>
        ${selectedPlace.current}

        <br><br>

        <b>State</b><br>
        ${selectedPlace.state}

        <br><br>

        <b>Category</b><br>
        ${selectedPlace.category}

        <br><br>

        ${selectedPlace.info}

    `;


    positionPopup();

}


/* =========================================================
   POPUP POSITION
   ========================================================= */

function positionPopup() {

    if (
        !selectedPlace ||
        popup.style.display !== "block"
    ) {
        return;
    }

    const markerLeft =
        Number(marker.dataset.left || 0);

    const markerTop =
        Number(marker.dataset.top || 0);


    const popupWidth =
        popup.offsetWidth;

    const popupHeight =
        popup.offsetHeight;


    const containerWidth =
        mapContainer.clientWidth;

    const containerHeight =
        mapContainer.clientHeight;


    const gap = 20;


    /*
       முதலில் Marker-ன் வலப்புறம்
       Popup வைக்க முயற்சி
    */

    let left =
        markerLeft + gap;

    let top =
        markerTop - popupHeight / 2;


    /*
       வலப்புறத்தில் இடம் இல்லையென்றால்
       Marker-ன் இடப்புறம்
    */

    if (
        left + popupWidth >
        containerWidth
    ) {

        left =
            markerLeft -
            popupWidth -
            gap;

    }


    /*
       கீழே வெளியே சென்றால்
       மேலே கொண்டு வருதல்
    */

    if (
        top + popupHeight >
        containerHeight
    ) {

        top =
            containerHeight -
            popupHeight -
            gap;

    }


    /*
       மேலே வெளியே சென்றால்
       கீழே கொண்டு வருதல்
    */

    if (top < 10) {

        top = 10;

    }


    /*
       இடப்புறம் வெளியே சென்றால்
       10px margin
    */

    if (left < 10) {

        left = 10;

    }


    popup.style.left =
        left + "px";

    popup.style.top =
        top + "px";

}

/* =========================================================
   CLOSE POPUP
   ========================================================= */

function hidePopup() {

    popup.style.display =
        "none";

    // Marker மறையக்கூடாது
    if (selectedPlace) {

        marker.style.display =
            "block";

    }

}

if (closePopup) {

    closePopup.addEventListener(
        "click",
        function () {

            hidePopup();

        }
    );

}


/* =========================================================
   ZOOM + PAN TRANSFORM
   ========================================================= */

function applyTransform() {

    mapObject.style.transform =
        `translate(${translateX}px, ${translateY}px) scale(${scale})`;

    mapObject.style.transformOrigin =
        "center center";


    /*
       Marker-ஐ map உடன் நகர்த்துதல்
    */

    updateMarker();


    /*
       Popup-ஐ marker-ஐ பின்பற்றச் செய்தல்
    */

    positionPopup();

}


/* =========================================================
   ZOOM IN
   ========================================================= */

if (zoomInBtn) {

    zoomInBtn.addEventListener(
        "click",
        function () {

            scale += 0.2;

            if (scale > 5) {
                scale = 5;
            }

            applyTransform();

        }
    );

}


/* =========================================================
   ZOOM OUT
   ========================================================= */

if (zoomOutBtn) {

    zoomOutBtn.addEventListener(
        "click",
        function () {

            scale -= 0.2;

            if (scale < 0.5) {
                scale = 0.5;
            }

            applyTransform();

        }
    );

}


/* =========================================================
   RESET MAP
   ========================================================= */

if (resetBtn) {

    resetBtn.addEventListener(
        "click",
        function () {

            scale = 1;

            translateX = 0;

            translateY = 0;

            applyTransform();


            if (selectedPlace) {

                updateMarker();

                positionPopup();

            }

        }
    );

}


/* =========================================================
   MOUSE WHEEL ZOOM
   ========================================================= */

mapContainer.addEventListener(
    "wheel",
    function (e) {

        e.preventDefault();


        if (e.deltaY < 0) {

            scale += 0.1;

        }
        else {

            scale -= 0.1;

        }


        if (scale < 0.5) {
            scale = 0.5;
        }


        if (scale > 5) {
            scale = 5;
        }


        applyTransform();

    },
    {
        passive: false
    }
);


/* =========================================================
   DRAG / PAN
   ========================================================= */

let isDragging = false;

let dragStartX = 0;
let dragStartY = 0;

let initialTranslateX = 0;
let initialTranslateY = 0;


mapContainer.addEventListener(
    "mousedown",
    function (e) {

        if (e.button !== 0) {
            return;
        }


        isDragging = true;


        dragStartX =
            e.clientX;

        dragStartY =
            e.clientY;


        initialTranslateX =
            translateX;

        initialTranslateY =
            translateY;


        mapContainer.style.cursor =
            "grabbing";

    }
);


document.addEventListener(
    "mousemove",
    function (e) {

        if (!isDragging) {
            return;
        }


        const dx =
            e.clientX -
            dragStartX;


        const dy =
            e.clientY -
            dragStartY;


        translateX =
            initialTranslateX +
            dx;


        translateY =
            initialTranslateY +
            dy;


        applyTransform();

    }
);


document.addEventListener(
    "mouseup",
    function () {

        isDragging =
            false;


        mapContainer.style.cursor =
            "grab";

    }
);


/* =========================================================
   DOUBLE CLICK ZOOM
   ========================================================= */

mapContainer.addEventListener(
    "dblclick",
    function () {

        scale += 0.5;


        if (scale > 5) {
            scale = 5;
        }


        applyTransform();

    }
);


/* =========================================================
   CLICK EMPTY MAP
   ========================================================= */

mapContainer.addEventListener(
    "click",
    function (e) {

        // Popup அல்லது Marker மீது click செய்தால்
        // எதையும் மறைக்க வேண்டாம்.

        if (
            e.target === popup ||
            popup.contains(e.target) ||
            e.target === marker
        ) {
            return;
        }

        // காலியான map பகுதியில் மட்டும்
        // Popup-ஐ மூடலாம்.
        if (e.target === mapContainer) {

            popup.style.display = "none";

            // Marker-ஐ மறைக்க வேண்டாம்!
            marker.style.display = "block";

        }
    }
);


/* =========================================================
   ESC KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    function (e) {

        if (e.key === "Escape") {

            hidePopup();

        }

    }
);


/* =========================================================
   RESIZE
   ========================================================= */

window.addEventListener(
    "resize",
    function () {

        if (selectedPlace) {

            updateMarker();

            positionPopup();

        }

    }
);


/* =========================================================
   SHOW ALL PLACES
   ========================================================= */

if (showAllBtn) {

    showAllBtn.addEventListener(
        "click",
        function () {

            showAllPlaces();

        }
    );

}

window.addEventListener("load", function () {

    console.log("===== MAP SIZE TEST =====");

    console.log(
        "SVG Original:",
        SVG_WIDTH,
        "×",
        SVG_HEIGHT
    );

    console.log(
        "Displayed Width:",
        mapObject.clientWidth
    );

    console.log(
        "Displayed Height:",
        mapObject.clientHeight
    );

    console.log(
        "Actual Bounding Width:",
        mapObject.getBoundingClientRect().width
    );

    console.log(
        "Actual Bounding Height:",
        mapObject.getBoundingClientRect().height
    );

});
/* =========================================================
   START
   ========================================================= */
function showAllPlaces() {

    console.log(
        "Showing all places:",
        places.length
    );

    /*
       ஏற்கனவே உள்ள All Place markers
       இருந்தால் முதலில் நீக்குதல்
    */

    document
        .querySelectorAll(".all-place-marker")
        .forEach(function (item) {
            item.remove();
        });


    /*
       Popup மூடுதல்
    */

    popup.style.display = "none";


    /*
       தற்போதைய பெரிய Marker மறைத்தல்
    */

    marker.style.display = "none";

    selectedPlace = null;


    /*
       Map-ஐ Reset செய்தல்
    */

    scale = 1;
    translateX = 0;
    translateY = 0;

    applyTransform();


    /*
       Map image-ன் உண்மையான displayed rectangle
    */

    createAllPlaceMarkers();

}
function createAllPlaceMarkers() {

    /*
       Map-ன் layout size
       getBoundingClientRect() பயன்படுத்தக்கூடாது.
       அது transform காரணமாக அளவை மாற்றிக் காட்டலாம்.
    */

    const mapWidth =
        mapObject.offsetWidth;

    const mapHeight =
        mapObject.offsetHeight;


    console.log(
        "ALL MARKERS MAP SIZE:",
        mapWidth,
        "×",
        mapHeight
    );


    places.forEach(function (place, index) {

        const placeMarker =
            document.createElement("div");


        placeMarker.className =
            "all-place-marker";


        placeMarker.dataset.index =
            index;


        placeMarker.title =
            place.name +
            " – " +
            place.current;


        /*
           Original SVG coordinate
           → displayed map coordinate
        */

        const x =
            (place.x / SVG_WIDTH) *
            mapWidth;


        const y =
            (place.y / SVG_HEIGHT) *
            mapHeight;


        /*
           Marker position
        */

        placeMarker.style.left =
            x + "px";

        placeMarker.style.top =
            y + "px";


        /*
           Marker-ஐ mapContainer-ல் சேர்க்கவும்
        */

        mapContainer.appendChild(
            placeMarker
        );


        /*
           Debug
        */

        console.log(
            index + 1,
            place.name,
            "X=",
            place.x,
            "Y=",
            place.y,
            "LEFT=",
            x,
            "TOP=",
            y
        );


        /*
           Marker click
        */

        placeMarker.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();


                /*
                   All markers நீக்குதல்
                */

                document
                    .querySelectorAll(
                        ".all-place-marker"
                    )
                    .forEach(function (item) {

                        item.remove();

                    });


                /*
                   Selected place
                */

                selectedPlace =
                    place;


                /*
                   Normal marker
                */

                updateMarker();


                /*
                   Popup
                */

                showPopup();

            }
        );

    });


    console.log(
        "ALL MARKERS CREATED:",
        places.length
    );

}
loadPlaces();