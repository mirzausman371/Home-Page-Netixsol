let languageButton = document.getElementById("language-selector");

const closeTransifexDropdown = (event) => {
    if (event.target.id !== "tx-live-lang-current" && event.target.id !== "tx-live-lang-toggle") {
        document.getElementById("tx-live-lang-picker").classList.remove("txlive-langselector-list-opened");
        languageButton.style.backgroundColor = "transparent";
    }
}

const openTransifexDropdown = () => {
    document.getElementById("tx-live-lang-picker").classList.add("txlive-langselector-list-opened");
    languageButton.style.backgroundColor = "red";
}

const languageButtonClickHandler = (event) => {
    let languageDropdownList = document.getElementById("tx-live-lang-picker");
    let langSelectorOpen = languageDropdownList.className.indexOf("txlive-langselector-list-opened") !== -1 ? true : false;

    if (langSelectorOpen) {
        openTransifexDropdown()
        languageButton.style.backgroundColor = "#1C2127";
        document.addEventListener("click", closeTransifexDropdown);
    } else {
        languageButton.style.backgroundColor = "transparent";
    }
}

languageButton.addEventListener("click", languageButtonClickHandler);