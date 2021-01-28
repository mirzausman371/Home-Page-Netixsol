// used by the five submission forms on the site to animate notification after submission
function formSubmitted(form){
    notificationElement = form.querySelector('#submissionNotification');
    notificationElement.style.opacity = 1;

    setTimeout(function() {
		notificationElement.style.opacity = 0;
	}, 2000);

    submitButton = form.querySelector('button');
    submitButton.disabled = true;
}