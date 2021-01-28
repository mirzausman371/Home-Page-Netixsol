var slideIndex = 1;
showDivs(slideIndex);

function plusDivs(n) {
    showDivs(slideIndex += n);
}

function currentDiv(n) {
    showDivs(slideIndex = n);
}

function showDivs(n) {
    var i;
    var images = document.getElementsByClassName("satellite_how-it-works_section_icon");
    var textBlocks = document.getElementsByClassName("satellite_how-it-works_section_text");
    var indicators = document.getElementsByClassName("satellite_how-it-works_section_icon_navigation_indicator");

    // come up with better solution for this after demo
    if (images.length === 0 || indicators.length === 0) {
        return;
    }

    if (n > images.length) {slideIndex = 1}    
    if (n < 1) {slideIndex = images.length}

    for (i = 0; i < images.length; i++) {
        images[i].style.opacity = 0;  
        textBlocks[i].style.opacity = 0;
    }

    for (i = 0; i < indicators.length; i++) {
        indicators[i].className = indicators[i].className.replace(" indicator-fill", "");
    }
 
    images[slideIndex - 1].style.opacity = 1;  
    textBlocks[slideIndex - 1].style.opacity = 1;
    indicators[slideIndex - 1].className += " indicator-fill";
}


const dishpointerShowAddress = () => {
    let point_address = document.getElementById("point_address");
    let point_lat = document.getElementById("point_lat");
    let point_long = document.getElementById("point_long");

    point_address.style.display = "block";
    point_lat.style.display = "none";
    point_long.style.display = "none";
};

const dishpointerShowCoordinates = () => {
    let point_address = document.getElementById("point_address");
    let point_lat = document.getElementById("point_lat");
    let point_long = document.getElementById("point_long");

    point_address.style.display = "none";
    point_lat.style.display = "block";
    point_long.style.display = "block";
};


// toggle satellite widget display
const widgetClicked = () => {
    let widget = document.getElementById("satellite-widget_container");
    
    if (widget.style.display === "none") {
        widget.style.display = "block";
    } else {
        widget.style.display = "none";
    }
};

const mobileWidgetClicked = () => {
    let widget = document.getElementById("satellite-widget_mobile_container");
    
    if (widget.style.display === "none") {
        widget.style.display = "block";
    } else {
        widget.style.display = "none";
    }
};