
// ========= BLOG LANGUAGE SELECTION LINK =========

// globals
let transifexLanguage;

// set initial language
window.onload = () => {
    transifexLanguage = document.getElementById("tx-live-lang-current").innerText;
};

const getLanguageCode = (language) => {
    switch (language) {
        case "English":
            return "en";

        case "Deutsch":
            return "de";

        case "Italiano":
            return "it";

        case "Nederlands":
            return "nl";

        case "Français":
            return "fr";

        case "日本語":
            return "ja";

        case "한국어":
            return "ko";

        case "Русский":
            return "ru";

        case "Español":
            return "es";

        case "中文":
            return "zh";

        default:
            return "en";
    }
}


// the transifex language is selected dependent on the user's browser locale
// determine which language link to send the user to depending on what language is set on transifex

const blogLinkClicked = (e) => {
    e.preventDefault();

    let blogLink = "/blog/";

    blogLink = blogLink + getLanguageCode(transifexLanguage) + "/";

    window.location = blogLink;
};

// ========= ============================ =========

// SET UP EVENT LISTENERS
let arrBlogLinks = document.getElementsByClassName("blog-link");

for (let i = 0; i < arrBlogLinks.length; i++) {
    arrBlogLinks[i].addEventListener("click", () => blogLinkClicked(event), false);
};



// change language global if transifex language is changed
const languageSelectorClicked = () => {
    let newLanguage = document.getElementById("tx-live-lang-current").innerText;
    if (newLanguage === transifexLanguage) {
        return;
    }

    transifexLanguage = newLanguage;

    // check if on an blog post page
    let blogPostPattern = /^(\/)\d{4}(\/)(((0)[0-9])|((1)[0-2]))(\/)([0-2][0-9]|(3)[0-1])(\/)([a-z]{2}\-)/;
    if (blogPostPattern.test(window.location.pathname)) {
        let originalPostLink = window.location.pathname;
        let postDate = originalPostLink.substr(0, 12);
        let postLanguageCode = originalPostLink.substr(12, 2);
        let postTitle = originalPostLink.substr(14);

        let newLanguageCode = getLanguageCode(transifexLanguage);

        let redirectLink = postDate + newLanguageCode + postTitle;

        window.location = redirectLink;
    }

    // check if on blog listing page
    else if (window.location.pathname.substr(0, 6) === "/blog/") {
        let redirectLink = "";
        
        // default -- english does not include the language code
        if (window.location.pathname === "/blog/") {
            redirectLink = window.location.href;
        } else {
            redirectLink = window.location.href.substr(0, (window.location.href.length - 3));
        }
        
        redirectLink = redirectLink + getLanguageCode(transifexLanguage) + "/";
        window.location = redirectLink;
    }

    // if not on either of those pages -- get out
    else {
        return;
    }
};

let transifexSwitcher = document.getElementById("language-selector");
transifexSwitcher.addEventListener("click", languageSelectorClicked);