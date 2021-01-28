
// Mobile Phones only -- Fixed Sub-menu animation e.g Liquid menu, NetixSol green etc 
const slideInRight = () => {
  if (window.innerWidth <= 736){
    let slideInRightContainer = document.querySelector(".product-sub-nav_container");
    slideInRightContainer.classList.add("slide-in-right");
  }
}
window.addEventListener('load', slideInRight)



// toggle mobile navigation
function mobileNavToggle() {
  const nav = document.querySelector('.header_primary_navigation');
  let navItems = document.querySelectorAll(".header_primary_navigation_item")
  let hamburger = document.querySelector(".hamburger")

  if(nav.classList.contains('mobile-navbar-show')){
    hamburger.classList.remove("hamburger-open")
    navItems.forEach(item => item.classList.remove('show-items'));
    setTimeout(()=>{
      nav.classList.remove('mobile-navbar-show');
    }, 250)
    
  }else{
    hamburger.classList.add("hamburger-open")
    nav.classList.add('mobile-navbar-show');
    setTimeout(()=>{
      navItems.forEach(item => item.classList.add('show-items'));
    }, 350)
  }
}



//Navigation Dropdown
function mobileNavDropdown(e) {
  // Select all Drop Down Items
  var allDropdown = document.querySelectorAll(".header_primary_navigation_item_sub-list");
  // Get Clicked Item Sibling i.e Dropdown of Selected item
  let targetSibling = e.target.nextElementSibling;
  
  allDropdown.forEach(item => {
    //If item is target add Toggle Event else Close all dropdown
    // The Selected Item stays open while the rest closes
    if(item === targetSibling){
      let targetSubNav = targetSibling.classList
      if(targetSubNav.contains("mobile-dropdown-show")){
        targetSubNav.remove("mobile-fadeIn")
        setTimeout(()=>{
          targetSubNav.remove("mobile-dropdown-show")
        }, 100)
      }else{
        targetSubNav.add("mobile-dropdown-show")
        setTimeout(()=>{
          targetSubNav.add("mobile-fadeIn")
        }, 100)
      }
    }else{
      item.classList.remove("mobile-fadeIn")
      item.classList.remove("mobile-dropdown-show")
    }
  })

  // changes the icon to "Up Arrow" by adding a class to the target element
  // Also resets arrows on all open Items

  let targetItem = e.target
  var dropDownArrows = document.querySelectorAll(".header_primary_navigation_item_link")
  dropDownArrows.forEach(item => {
    if(item === targetItem){
      targetItem.classList.toggle("dropdown-icon")
    }else{
      item.classList.remove("dropdown-icon")
    }
  })
}


// color change for navigation
const arrObjProducts = [
  {
    item: "liquid",
    group: "products",
    color: "#46b4a5"
  },
  {
    item: "ice",
    group: "products",
    color: "#00aed9"
  },
  {
    item: "green-address",
    group: "products",
    color: "#00b45a"
  },
  {
    item: "satellite",
    group: "products",
    color: "#3C82F9"
  },
  {
    item: "mining",
    group: "products",
    color: "#8356FF"
  },
  {
    item: "block-explorer",
    group: "products",
    color: "#00c3ff"
  },
  {
    item: "lightning",
    group: "technologies",
    color: "#C6B24B"
  },
  {
    item: "elements",
    group: "technologies",
    color: "#677FD3"
  },
  {
    item: "blog",
    group: "news",
    color: "#00c3ff"
  },
  {
    item: "whitepaper",
    group: "technologies",
    color: "#00c3ff"
  },
  {
    item: "newsroom",
    group: "news",
    color: "#00c3ff"
  },
  {
    item: "press-release",
    group: "news",
    color: "#00c3ff"
  },
  {
    item: "about",
    group: "about",
    color: "#00c3ff"
  },
  {
    item: "careers",
    group: "about",
    color: "#00c3ff"
  },
  {
    item: "contact",
    group: "about",
    color: "#00c3ff"
  },
  {
    item: "whitepaper",
    group: "technologies",
    color: "#00c3ff"
  },
  {
    item: "eng-blog",
    group: "developer",
    color: "#00c3ff"
  },
  {
    item: "documentation",
    group: "developer",
    color: "#00c3ff"
  }
];


$(function() {

  let activeNavItem = document.querySelector(".nav-link-active");

  if (activeNavItem === null) { return };

  let productItem = arrObjProducts.find(element => {
    if (element.item === activeNavItem.dataset.navItem) { return element };
  });

  if (productItem) {
    $("#primary_navigation_" + productItem.item + " a").css({"color": productItem.color});
  }
});


// SCROLLING - HIDE AND SHOW HEADER NAVIGATION
let prevScrollpos = window.pageYOffset;

if (window.innerWidth >= 1090) {
  window.onscroll = function() {
    let currentScrollPos = window.pageYOffset;
    let navigation = document.querySelector(".header_primary");
    let subNav = document.querySelector(".product-sub-nav");
  
    if (prevScrollpos > currentScrollPos) {
      navigation.style.top = "0";

      if (subNav !== null) {
        subNav.style.top = "80px"
      }
      
    } else {
      if (currentScrollPos > 100) {
        navigation.style.top = "-60rem";

        if (subNav !== null) {
          subNav.style.top = "-60rem";
        }
      }
    }

    let topHeader = document.getElementById("header-primary");
    

    if (window.pageYOffset < 60) {
      topHeader.style.backgroundColor = "transparent";
    } else {
      topHeader.style.backgroundColor = "#0d1526";
    }
  
    prevScrollpos = currentScrollPos;
  };
}



// keeping this for reference for the next time this changes
const navSelectCurrentPage = () => {
  let activeNavItem = document.querySelector(".nav-link-active");

  document.querySelectorAll(".header_primary_navigation_item_sub-list").forEach(el => {
    el.style.display = "none";
  });

  if (activeNavItem) { 

    let activeSection = activeNavItem.dataset.navItem;

    if (activeSection === "lightning" || activeSection === "elements") {
      // document.getElementById("primary_navigation_list_technologies").style.display = "block";

    } else if (activeSection === "liquid" || activeSection === "ice" || activeSection === "green-address" || activeSection === "satellite" || activeSection === "mining") {
      // document.getElementById("primary_navigation_list_products").style.display = "block";

    } else if (activeSection === "blog" || activeSection === "whitepaper" || activeSection === "press-release") {
      // document.getElementById("primary_navigation_list_news").style.display = "block";

    } else if (activeSection === "about" || activeSection === "careers") {
      // document.getElementById("primary_navigation_list_about").style.display = "block";

    } else {
      return;
    }
  }
}

// green download dropdown behavior
gradient_dropdown = document.getElementById("gradient-dropdown")
if (gradient_dropdown)
  gradient_dropdown.addEventListener('click', gradient_dropdown_toggle)

function gradient_dropdown_toggle(e){
  let content = document.getElementById("gradient-dropdown-content")
  if (content.classList.contains('content-visible'))
    content.classList.remove('content-visible');
  else
    content.classList.add('content-visible');
}



