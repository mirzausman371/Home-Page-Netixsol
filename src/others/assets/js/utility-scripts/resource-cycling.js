// redisplay resources if screen is resized / added delay so we don't call the function too often
// if resized to mobile navigation size or back to desktop, reload the page (this is a temporary solution for now)
let prevWindowSize;
window.onresize = () => {

    if (window.innerWidth > 950 && prevWindowSize < 950 || window.innerWidth < 950 && prevWindowSize > 950) {
        
        // firefox and safari seem to require a setTimeout to use reload()
        setTimeout(function(){
            window.location.reload();
        }, 0);
    }

    setTimeout(() => {
        currentResource();
    }, 500);

    prevWindowSize = window.innerWidth;
};

// CYCLE FOR TOP STORIES AND RESOURCE SECTIONS
let resourceIndexStart = 1;
const objResource =
{
    type: "resources",
    container: ".resources_story",
    arrowBack: ".resources_container_arrow-back",
    arrowForward: ".resources_container_arrow-forward"
}

currentResource();

function backResource(n, type) {
    showResource(resourceIndexStart -= n, type);
}

function forwardResource(n, type) {
    showResource(resourceIndexStart += n, type);
}

// used to adjust the amount of resources displayed - if screen is resized
function currentResource() {
    showResource(resourceIndexStart, objResource.type)
}

function showResource(n, type) {

    // check if resource exists
    let resources = document.querySelectorAll(objResource.container);

    if (resources.length == 0) {
        return;
    }

    // hide arrow buttons if resources are out of range
    let resourcesToDisplay = 2 // need to adjust this for different screen sizes

    if (window.innerWidth < 650) {
        resourcesToDisplay = 0;
    } else if (window.innerWidth < 1000) {
        resourcesToDisplay = 1;
    } else {
        resourcesToDisplay = 2;
    }

    let first = n;
    let last = n + resourcesToDisplay;

    if (first === 1) {
        document.querySelector(objResource.arrowBack).style.visibility = "hidden";

    } else {
        document.querySelector(objResource.arrowBack).style.visibility = "visible";
    }
    
    if (last === resources.length) {
        document.querySelector(objResource.arrowForward).style.visibility = "hidden";
    } else {
        document.querySelector(objResource.arrowForward).style.visibility = "visible";
    }

    
    // display resources
    resources.forEach(resource => {

        if (resource.id.slice(-1) < first || resource.id.slice(-1) > last) {
            resource.style.display = "none";
        } else {
            resource.style.display = "block";
        }
        
    });
};