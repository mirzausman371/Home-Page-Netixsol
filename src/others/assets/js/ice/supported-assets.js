const supportedAssetsToggleClicked = () => {

    let crypto = document.getElementById("supported-assets_crypto");
    let fiat = document.getElementById("supported-assets_fiat");

    if (crypto.style.display === "none" && fiat.style.display === "flex") {
        crypto.style.display = "flex";
        fiat.style.display = "none";
    } else {
        crypto.style.display = "none";
        fiat.style.display = "flex";
    }
};