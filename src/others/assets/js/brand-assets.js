
//******************************************
// First Color in "Color Flex Container" has a CSS class (expandFirst and expandFirstGrad) that expands it by default.
// These Script removes it "on mouse hover" 
//******************************************

let allColors = document.querySelectorAll('.solidContainer .colorBg')
let allGradientColors = document.querySelectorAll('.gradContainer .colorBg')

var screenSize = window.matchMedia("(max-width: 900px)")

// Remove the Expand Class on Hover
  allColors.forEach((color) => {
    color.addEventListener('mouseover', removeExpand)
   })

   allGradientColors.forEach((color) => {
    color.addEventListener('mouseover', removeExpandGrad)
   })


function removeExpand (){
  var firstColor = document.querySelector('.solid-liquid')
  firstColor.classList.remove('expandFirst')
}

function removeExpandGrad (){
    var firstColor = document.querySelector('.grad-liquid')
    firstColor.classList.remove('expandFirstGrad')
  }


