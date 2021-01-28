const exitCryptoAssetsPopUp = () => {
    cryptoAssetsPopUp = document.getElementById("crypto-assets-pop-up");
    cryptoAssetsBackdrop = document.getElementById("crypto-assets-backdrop");

    cryptoAssetsPopUp.style.display = "none";
    cryptoAssetsBackdrop.style.display = "none";

    cryptoAssetsPopUp.classList.toggle("show-modal")
};

const expandCryptoAssetsPopUp = () => {
    cryptoAssetsPopUp = document.getElementById("crypto-assets-pop-up");
    cryptoAssetsBackdrop = document.getElementById("crypto-assets-backdrop");

    cryptoAssetsPopUp.style.display = "flex";
    cryptoAssetsBackdrop.style.display = "block";

    cryptoAssetsPopUp.classList.toggle("show-modal")
};


// event listeners for crypto coins
let cryptoCoins = document.getElementsByClassName("supported-assets_crypto_coin");

for(let i = 0; i < cryptoCoins.length; i++) {
    cryptoCoins[i].addEventListener("click", expandCryptoAssetsPopUp, false);
};