// ========= BLOG AUTHOR NAME FORMATTING =========

const capitalizeFirstLetter = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};


const formatAuthorName = authorString => {

    let formattedName = "";

    nameArray = authorString.split("-");

    // first / last name pair
    for (let i = 0; i < nameArray.length; i++) {
        
        let splitName = nameArray[i].split("'");
        let formattedSingleName = "";

        for (let j = 0; j < splitName.length; j++) {
            if (j !== 0) {
                formattedSingleName += "'";
            }
            formattedSingleName += capitalizeFirstLetter(splitName[j]);
        };

        if (i !== 0) {
            formattedName += " ";
        }
        formattedName += formattedSingleName;
        
    };

    document.write(formattedName);
};

// ========= =========================== =========
