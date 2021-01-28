var slideIndex = 1;
careersShowDivs(slideIndex);

function careersPlusDivs(n) {
    careersShowDivs(slideIndex += n);
}

function careersCurrentDiv(n) {
    careersShowDivs(slideIndex = n);
}

function careersShowDivs(n) {
    var i;
    var images = document.getElementsByClassName("careers_opportunity_icon");
    var indicators = document.getElementsByClassName("careers_opportunity_icon_navigation_indicator");

    // if not on careers page, get out -- come up with a better solution after demo
    if (images.length === 0 || indicators.length === 0) {
        return;
    }

    if (n > images.length) {slideIndex = 1}    
    if (n < 1) {slideIndex = images.length}

    for (i = 0; i < images.length; i++) {
        images[i].style.display = "none";  
    }

    for (i = 0; i < indicators.length; i++) {
        indicators[i].className = indicators[i].className.replace(" indicator-fill", "");
    }

    images[slideIndex-1].style.display = "block";  
    indicators[slideIndex-1].className += " indicator-fill";
}
