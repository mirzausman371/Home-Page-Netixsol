function toggle_members_popup(e){
	e.preventDefault();

	popup = document.getElementById('members-popup')
	overlay = document.getElementById('member_list_overlay')

	if (popup.style.display == "none" || popup.style.display == ""){
		popup.style.display = "block"
		overlay.style.display = "block"
	}
	else{
		popup.style.display = "none"
		overlay.style.display = "none"
	}

	popup.classList.toggle("show-modal");
}

// var logo_holder = document.getElementById('logo-holder');
// var items = document.getElementsByClassName("logo-item");
// for (i=0; i<items.length; i++){
// 	items[i].style.transform = 'scale(0)';
// }

// triggered = false;
// window.addEventListener('scroll', logo_scale);

// function logo_scale(){
//     if (!triggered && logo_holder.getBoundingClientRect().y  - window.innerHeight < -100){
//     	triggered = true;

// 		for (i=0; i<items.length; i++){
// 			items[i].style.animation = 'fade-in 1s cubic-bezier(.2, 3, .6, .6) '+i*.05+'s both';
// 		}
//     }
// }

