
const expandNewsletterModal = () => {
    cryptoAssetsPopUp = document.getElementById("newsletter-modal");
    cryptoAssetsBackdrop = document.getElementById("newsletter-backdrop");

    cryptoAssetsPopUp.style.display = "flex";
    cryptoAssetsBackdrop.style.display = "block";

    cryptoAssetsPopUp.classList.toggle("show-modal")
};

const exitNewsletterModal = () => {
    cryptoAssetsPopUp = document.getElementById("newsletter-modal");
    cryptoAssetsBackdrop = document.getElementById("newsletter-backdrop");

    cryptoAssetsPopUp.style.display = "none";
    cryptoAssetsBackdrop.style.display = "none";

    cryptoAssetsPopUp.classList.toggle("show-modal")
};