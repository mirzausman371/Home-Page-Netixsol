// redisplay articles if screen is resized / added delay so we don't call the function too often
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
        currentArticles();
    }, 500);

    prevWindowSize = window.innerWidth;
};



// CYCLE ARTICLES
let articleIndexStart = 1;
const objArticle =
{
    type: "articles",
    container: ".in-the-news_article",
    arrowBack: ".in-the-news_arrow-back",
    arrowForward: ".in-the-news_arrow-forward"
}

currentArticles();

function backNewsArticle(n, type) {
    showArticle(articleIndexStart -= n, type);
}

function forwardNewsArticle(n, type) {
    showArticle(articleIndexStart += n, type);
}

// used to adjust the amount of articles displayed - if screen is resized
function currentArticles() {
    showArticle(articleIndexStart, objArticle.type)
}

function showArticle(n, type) {

    // check if resource exists
    let articles = document.querySelectorAll(objArticle.container);

    if (articles.length == 0) {
        return;
    }

    // hide arrow buttons if articles are out of range
    let articlesToDisplay = 2 // need to adjust this for different screen sizes

    if (window.innerWidth < 650) {
        articlesToDisplay = 0;
    } else if (window.innerWidth < 1000) {
        articlesToDisplay = 1;
    } else {
        articlesToDisplay = 2;
    }

    let first = n;
    let last = n + articlesToDisplay;

    if (first === 1) {
        document.querySelector(objArticle.arrowBack).style.visibility = "hidden";

    } else {
        document.querySelector(objArticle.arrowBack).style.visibility = "visible";
    }
    
    if (last === articles.length) {
        document.querySelector(objArticle.arrowForward).style.visibility = "hidden";
    } else {
        document.querySelector(objArticle.arrowForward).style.visibility = "visible";
    }

    
    // display articles
    articles.forEach(article => {

        if (article.id.slice(-1) < first || article.id.slice(-1) > last) {
            article.style.display = "none";
        } else {
            article.style.display = "block";
        }
        
    });
};


