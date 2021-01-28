// var acc = document.getElementsByClassName("accordion");
// for (let i = 0; i < acc.length; i++) {
//   acc[i].addEventListener("click", function() {
//     this.classList.toggle("active");
//   });
// }

/*******************************************************
 * The Code Above works but the animation is not smooth
 *******************************************************/




 /*******************************************************
 * Accordion with smooth Animation
 *******************************************************/
let acc = document.getElementsByClassName("accordion");
acc = Array.from(acc) // convert to array 
acc.map(item =>{  
    item.addEventListener("click", function(event){
        //prevent propagation when link is clicked
        let clickedItem = event.target.classList
        if( clickedItem.contains("accordion-expand_article_author") || 
            clickedItem.contains("accordion-expand_article_title") ||
            clickedItem.contains("accordion-expand_article")){
            return
        }

        // add class "active to keep track of clicked element"
        if (this.classList.contains("active")){
             // LastChild is the expanded Element when clicked
             // remove height and opacity for smooth animation
            let expandOpen = this.lastChild
            expandOpen.style.height = 0
            expandOpen.style.padding = 0
            expandOpen.style.opacity = 0
           
            this.classList.remove("active");
           
        }else{
            this.classList.add("active");
            let currentExpand = this.lastChild

            // Set height to auto so that we can calculate the Accordion's height
            currentExpand.style.height = "auto"

            // Add 30 as Padding Bottom
            let expandHeight = currentExpand.clientHeight+30
                
            // set css height and opacity for smooth animation
            
            currentExpand.style.height = expandHeight+"px"
            currentExpand.style.opacity = 1
        }
    
    });
})

// Resets Accordion when Window is Resize
// Change Height to Auto and add Padding Bottom
window.addEventListener("resize", function(event) { 
    let acc = document.getElementsByClassName("active"); 
    for (let i = 0; i < acc.length; i++) {
        acc[i].lastChild.style.height = "auto"
        acc[i].lastChild.style.paddingBottom = "30px"
    }
})