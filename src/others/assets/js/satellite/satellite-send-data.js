// constants
const milliSatoshiPerByte = 50;
const maxBlocksatPayload = 1464;
const overheadL2 = 52;

// globals
let minBidMillisatoshi = 0;
let minBidSatoshi = 0;
let manageTransactionsCurrentFileSize;

let usingFileUpload = false;

let allowStep2 = false;
let allowStep3 = false;
let fileAndMessageUploaded = false;


const clearMessageFields = () => {
    let successMessage = document.getElementById("satellite-send-data_upload-result_text_success");
    let failMessage = document.getElementById("satellite-send-data_upload-result_text_fail");

    successMessage.innerHTML = "";
    failMessage.innerHTML = "";

    successMessage.style.display = "none";
    failMessage.style.display = "none";
};



// step navigation:
var stepIndex = 1;
satelliteShowStep(stepIndex);

const sendDataShowStep = (n) => {

    let file = document.getElementById('satellite-send-data-file').files[0];
    let messageFieldFailed = document.getElementById("satellite-send-data_upload-result_text_fail");
    let messageFieldSuccess = document.getElementById("satellite-send-data_upload-result_text_success");
    messageFieldFailed.innerHTML = "";

    let payload;
    let payloadSize;
    if (usingFileUpload) {
        payload = document.getElementById('satellite-send-data-file').files[0];
        payloadSize = payload.size;
    } else {
        payload = document.getElementById("satellite-send-data-text").value;
        payloadSize = new Blob([payload]).size;
    }


    // add check if file is too small or too large
    if (payload && payloadSize > 1000000) {
        // error  - too large
        messageFieldFailed.innerHTML = "Failed - Upload must be smaller than 1mb."
        messageFieldFailed.style.display = "block";
        messageFieldSuccess.style.display = "none";
        // testing - note - remove this for larger files
        return;
    }

    // check if these steps are allowed yet:
    if (stepIndex === 1 && !allowStep2 && !fileAndMessageUploaded) {
        clearMessageFields();
        messageFieldFailed.innerHTML = "Please upload a file or enter a message.";
        messageFieldFailed.style.display = "block";
        return;
    
    } else if (stepIndex === 1 && !allowStep2 && fileAndMessageUploaded) {
        clearMessageFields();
        messageFieldFailed.innerHTML = "Only one upload is allowed at a time.";
        messageFieldFailed.style.display = "block";
        return;

    } else if (stepIndex === 2 && !allowStep3 && n === 1) {
        clearMessageFields();
        messageFieldFailed.innerHTML = "Please submit a valid Bid Rate.";
        messageFieldFailed.style.display = "block";
        return;

    } else if (stepIndex === 2 && n === -1) {
        sendDataReset();

    } else {
        satelliteShowStep(stepIndex += n);
    }
};

const sendDataCurrentStep = (n) => {
    satelliteShowStep(stepIndex = n);
}

function satelliteShowStep(n) {

    clearMessageFields();

    var i;
    var steps = document.getElementsByClassName("satellite-send-data_steps_step");
    var indicators = document.getElementsByClassName("satellite-send-data_steps_navigation_step-indicator_step");
    var indicatorConnectors = document.getElementsByClassName("satellite-send-data_steps_navigation_step-indicator_step_line");

    // if not on careers page, get out -- come up with a better solution after demo
    if (steps.length === 0 || indicators.length === 0) {
        return;
    }

    if (n > steps.length) {
        return;
    }    

    if (n < 1) {
        return;
    }

    for (i = 0; i < steps.length; i++) {
        steps[i].style.display = "none";  
    }

    // grey out any indicators past the step we're on
    for (i = 1; i <= indicators.length; i++) {
        if (i >= n) {
            indicators[i - 1].className = indicators[i - 1].className.replace(" satellite-step-indicator-fill", "");
            indicatorConnectors[i - 1].className = indicatorConnectors[i - 1].className.replace(" satellite-step-indicator-fill", "");
        }
    }

    steps[stepIndex-1].style.display = "flex";  
    indicators[stepIndex-1].className += " satellite-step-indicator-fill";
    indicatorConnectors[stepIndex-1].className += " satellite-step-indicator-fill";

    // previous & next buttons:
    let previousStep = document.getElementById("satellite-send-data_steps_navigation_previous");
    let previousStepText = document.getElementById("satellite-send-data_steps_navigation_previous_text");

    let nextStep = document.getElementById("satellite-send-data_steps_navigation_next");
    let nextStepText = document.getElementById("satellite-send-data_steps_navigation_next_text");

    let resetButton = document.getElementById("satellite-send-data_steps_navigation_reset");

    // show back button after step 2:
    if (n > 1) {
        previousStep.style.visibility = "visible";
    } else if (n === 1) {
        previousStep.style.visibility = "hidden";
    }

    // hide next button on last step:
    if (n === steps.length) {
        // nextStep.style.visibility = "hidden";
        nextStep.style.display = "none";
        resetButton.style.display = "flex";
    } else if (n < steps.length) {
        // nextStep.style.visibility = "visible";
        nextStep.style.display = "flex";
        resetButton.style.display = "none";
    }

    // change the label of previous and next buttons:

    let windowWidth = window.innerWidth;

    if (windowWidth > 550) {

        // tablet & desktop
        switch(n) {
            case 1:
                nextStepText.innerHTML = "Next: Bid Your Price";
                break;
            case 2:
                previousStepText.innerHTML = "Previous: Upload Your Files";
                nextStepText.innerHTML = "Next: Get Your Authentication Code";
                break;
            case 3:
                previousStepText.innerHTML = "Previous: Bid Your Price";
                nextStepText.innerHTML = "Next: Pay Through Lightning";
                break;
            case 4:
                previousStepText.innerHTML = "Previous: Get Your Authentication Code";
                break;
        }

    } else {

        // mobile
        switch(n) {
            case 1:
                nextStepText.innerHTML = "Next";
                break;
            case 2:
                previousStepText.innerHTML = "Previous";
                nextStepText.innerHTML = "Next";
                break;
            case 3:
                previousStepText.innerHTML = "Previous";
                nextStepText.innerHTML = "Next";
                break;
            case 4:
                previousStepText.innerHTML = "Previous";
                break;
        }

    }
    
}









// file upload:

let form = document.getElementById('satellite-send-data_upload_form');
let formButton = document.getElementById("satellite-send-data_upload_form_button");

form.onsubmit = function(event) {
    event.preventDefault(); 

    formButton.innerHTML = "Uploading...";

    let successMessage = document.getElementById("satellite-send-data_upload-result_text_success");
    let failMessage = document.getElementById("satellite-send-data_upload-result_text_fail");
    
    let formData = new FormData();
    let bidRate = parseInt(document.getElementById("satellite-send-data-bid-price").value);
    
    // 1. determine if file or message upload
    let payloadSize;
    let bid;

    if (usingFileUpload) {
        let file = document.getElementById('satellite-send-data-file').files[0];
        payloadSize = adjustSizeForOverhead(file.size);
        bid = parseInt(bidRate * payloadSize);

        if (file.size > 1000000) {
            // error  - too large
            failMessage.innerHTML = "Failed - File must be smaller than 1mb.";
            failMessage.style.display = "block";
            successMessage.style.display = "none";
            // testing - note - remove this for larger files
            return;
        }

        formData.append("file", file);
        formData.append("bid", bid);

    } else {
        // sending message instead of file

        let message = document.getElementById("satellite-send-data-text").value;
        let messageSize = new Blob([message]).size;
        payloadSize = adjustSizeForOverhead(messageSize);
        bid = parseInt(bidRate * payloadSize)

        formData.append("message", message);
        formData.append("bid", bid);

        if (messageSize > 1000000) {
            // error  - too large
            failMessage.innerHTML = "Failed - Message must be smaller than 1mb.";
            failMessage.style.display = "block";
            successMessage.style.display = "none";
            return;
        }
    }


    // check if the file size falls into the allowable limit  

    // check if the amount is high enough
    if (bidRate < milliSatoshiPerByte) {
        failMessage.innerHTML = "Upload Failed: Rate must be greater than the minimum bid rate of " + (milliSatoshiPerByte) + " millisatoshis per byte."
        failMessage.style.display = "block";
        successMessage.style.display = "none";

        formButton.innerHTML = "Submit";

    } else {

        // console.log(bid);

        let endpoint = satelliteAPIBaseUrl + "/order";

        axios({
            method: 'post',
            url: endpoint,
            data: formData,
            config: { headers: {'Access-Control-Allow-Origin': '*','Content-Type': 'multipart/form-data' }}
        })
        .then(function (response) {
            //handle success
            // console.log(response);
            successMessage.innerHTML = "Upload Successful."
            successMessage.style.display = "block";
            failMessage.style.display = "none";
            formButton.innerHTML = "Submit";
            allowStep3 = true;

            handleResponseData(response.data);

            // automatically move on to step 3
            sendDataCurrentStep(3);
        })
        .catch(function (error) {
            //handle error

            let errorCode = error.response.data.errors[0].code;
            let errorMessage = handleErrorResponse(errorCode);

            failMessage.innerHTML = errorMessage;

            successMessage.style.display = "none";
            failMessage.style.display = "block";
            formButton.innerHTML = "Submit";
            allowStep3 = false;
        });
    }
};



const handleResponseData = (data) => {

    // console.log(data);

    let authTokenDisplay = document.getElementById("satellite-send-data_steps_step_3_action_auth-code");
    authTokenDisplay.innerHTML = data.auth_token;

    let transactionIdDisplay = document.getElementById("satellite-send-data_steps_step_3_action_transaction-id");
    transactionIdDisplay.innerHTML = data.uuid;

    let paymentAddress = document.getElementById("satellite-send-data_steps_step_4_payment-block_payment-address");
    paymentAddress.innerHTML = data.lightning_invoice.payreq;

    //qr code
    let qrCodeContainer = document.getElementById("satellite-send-data_qr-code-container");
    qrCodeContainer.innerHTML = "";

    new QRCode(qrCodeContainer, data.lightning_invoice.payreq);

    // US - BTC conversion
    let conversionBlock = document.getElementById("satellite-send-data_steps_step_4_payment-block_conversion");

    let invoiceMillisatoshi = data.lightning_invoice.msatoshi;
    let invoiceBitcoin = (invoiceMillisatoshi * 0.00000000001).toFixed(10);
    let conversionMessage = `${invoiceBitcoin} BTC`;

    conversionBlock.innerHTML = conversionMessage;
};




// display file name when uploading a file / update the minimum bid (globals) and input in satoshis on step 2:
let elFileInput = document.getElementById("satellite-send-data-file");
let elFileLabelBlock = document.getElementById("satellite-send-data-file_label_block");
let elFileLabel = document.getElementById("satellite-send-data-file_label");
let inputBidPrice = document.getElementById("satellite-send-data-bid-price");

let elTextInput = document.getElementById("satellite-send-data-text");

elTextInput.addEventListener( 'change', (e) => {

    if (elTextInput.textLength !== 0 && !elFileInput.files[0]) {
        allowStep2 = true;
        fileAndMessageUploaded = false;
        usingFileUpload = false;
        inputBidPrice.value = milliSatoshiPerByte;

    } else if (elTextInput.textLength !== 0 && elFileInput.files[0]) {
        allowStep2 = false;
        fileAndMessageUploaded = true;

    } else if (elTextInput.textLength === 0 && elFileInput.files[0]) {
        allowStep2 = true;
        fileAndMessageUploaded = false;
        usingFileUpload = true;
    }
});

elFileInput.addEventListener( 'change', (e) => {

    let fileSizeBytes = adjustSizeForOverhead(elFileInput.files[0].size);
    minBidMillisatoshi = fileSizeBytes * milliSatoshiPerByte;
    minBidSatoshi = Math.ceil(minBidMillisatoshi / 100);

    // clear message field
    elTextInput.value = "";

    // default to minimum bid
    inputBidPrice.value = milliSatoshiPerByte;

    let fileName = '';
    fileName = e.target.value.split( '\\' ).pop();

    if ( fileName ) {
        elFileLabel.innerHTML = fileName;
        elFileLabelBlock.style.display = "flex";
        allowStep2 = true;
        usingFileUpload = true;
        clearMessageFields();

    } else {
        elFileLabel.innerHTML = "";
        elFileLabelBlock.style.display = "none";
        usingFileUpload = false;
        allowStep2 = false;
    }

    // calc conversion to BTC
    bidAmountChanged();
});


const sendDataReset = () => {
    // go back to the first step
    sendDataCurrentStep(1);

    allowStep2 = false;
    allowStep3 = false;
    usingFileUpload = false;

    let fileInputField = document.getElementById("satellite-send-data-file");
    let fileInputLabel = document.getElementById("satellite-send-data-file_label");
    let elFileLabelBlock = document.getElementById("satellite-send-data-file_label_block");
    let elTextInput = document.getElementById("satellite-send-data-text");
    
    elFileLabelBlock.style.display = "none";
    fileInputField.value = "";
    fileInputLabel.innerHTML = "";
    elTextInput.value = "";
};

const sendDataTopBid = () => {
    let bidPriceInput = document.getElementById("satellite-send-data-bid-price");
    bidPriceInput.value = Math.ceil(currentTopBidRate);
};


// note - need to fix this - account for overhead
const bidAmountChanged = () => {

    let bidRateInput = document.getElementById("satellite-send-data-bid-price");
    let bidBTCDisplay = document.getElementById("satellite-send-data_steps_step_2_action_btc-conversion");

    let payload;
    let payloadSize;
    if (usingFileUpload) {
        payload = document.getElementById('satellite-send-data-file').files[0];
        payloadSize = payload.size;
    } else {
        payload = document.getElementById("satellite-send-data-text").value;
        payloadSize = new Blob([payload]).size;
    }

    let adjustedPayloadSize = adjustSizeForOverhead(payloadSize);

    let satoshiAmount = (bidRateInput.value * adjustedPayloadSize / 1000);
    let btcAmount = (satoshiAmount / 100000000).toFixed(11);

    bidBTCDisplay.innerHTML = `${btcAmount} BTC`;
};



// mnage transmission:


// action selections:
const actionSectionSelect = (selectedSection, source = "") => {

    let sectionSendData = document.getElementById("satellite-queue_action_send-data");
    let sectionManageTransmission = document.getElementById("satellite-queue_action_manage-transmission");

    let selectionOptionsContainer = document.getElementById("satellite-queue_action-selection");

    switch (selectedSection) {

        case "send-data":
            sectionSendData.style.display = "block";
            // sectionManageTransmission.style.display = "none";
            // selectionOptionsContainer.style.display = "none";
            break;

        case "manage-transmission":
            sectionSendData.style.display = "none";
            sectionManageTransmission.style.display = "block";
            //selectionOptionsContainer.style.display = "none";
            break;

        case "exit":
            sectionSendData.style.display = "none";
            sectionManageTransmission.style.display = "none";
            selectionOptionsContainer.style.display = "flex";
            if (source === "manage-transmission") { clearManageTransmissionForm() }
            getSatelliteQueueData("queue");
            break;

        default:
            return;
    }

};


const finishTransmissionClicked = () => {
    // clear the transmission app
    sendDataReset();

    // exit
    actionSectionSelect('exit');

    // redirect to queue table
    tableSelection('queue');
};




// STEP 1

let manageTransForm = document.getElementById("satellite-manage-trans_step-1_form");
let manageTransSearchButton = document.getElementById("satellite-manage-trans_step-1_form_button");

manageTransForm.onsubmit = async function(event) {
    event.preventDefault(); 

    // make sure previous messages are removed:
    document.getElementById("satellite-queue_action_manage-transmission_body_success").style.display = "none";
    document.getElementById("satellite-queue_action_manage-transmission_body_error").style.display = "none";


    // check if uuid is valid:
    let transmissionId = document.getElementById("satellite-manage-trans_step-1_form_input_uuid").value;
    let authToken = document.getElementById("satellite-manage-trans_step-1_form_input_auth-token").value;

    let bumpError = document.getElementById("satellite-queue_action_manage-transmission_body_error");
    
    let endpoint = satelliteAPIBaseUrl + "/order/";
    endpoint = endpoint + transmissionId;

    axios.get(endpoint, {
        params: {
            auth_token: authToken
        }
    })
    .then(response => {
        //handle success
        // console.log("fetch success: ", response.data);
        // go back to uui input / add success message
        bumpError.style.display = "none";


        // update data fields:
        let dataFieldCreated = document.getElementById("satellite-manage-trans_step-2_block_row_data_created");

        let dataFieldTransmissionId = document.getElementById("satellite-manage-trans_step-2_block_row_data_transmission-id");
        let dataFieldBidRate = document.getElementById("satellite-manage-trans_step-2_block_row_data_bid-rate");
        let dataFieldMessageSize = document.getElementById("satellite-manage-trans_step-2_block_row_data_message-size");
        let dataFieldStatus = document.getElementById("satellite-manage-trans_step-2_block_row_data_status");

        let createdDate = new Date(response.data.created_at);
        createdDate = createdDate.toLocaleString();

        dataFieldCreated.innerHTML = createdDate;
        dataFieldTransmissionId.innerHTML = response.data.uuid;
        dataFieldBidRate.innerHTML = Math.floor(response.data.bid_per_byte);
        dataFieldMessageSize.innerHTML = response.data.message_size;
        
        if (response.data.status === "pending") {
            dataFieldStatus.innerHTML = "unpaid";
        } else {
            dataFieldStatus.innerHTML = response.data.status;
        }
        

        // don't show the bid rate for pending transactions
        if (response.data.status === "pending" && response.data.bid_per_byte === 0) {
            document.getElementById("satellite-manage-trans_step-2_block_row_data_bid-rate").style.display = "none";
        }
        

        // set global variable holding the current file size
        manageTransactionsCurrentFileSize = response.data.message_size;


        // for now - keep this step - pre-pop:
        let step2AuthCode = document.getElementById("satellite-manage-trans_step-2_actions_auth-code_input");
        step2AuthCode.value = authToken;

        // pre-pop the current bid amount:
        let newBidRate = document.getElementById("satellite-manage-trans_step-2_actions_new-bid-price_input");
        newBidRate.value = response.data.bid_per_byte;


        // move on to the next step next step
        let manageTransStep1 = document.getElementById("satellite-manage-trans_step-1");
        let manageTransStep2 = document.getElementById("satellite-manage-trans_step-2");
        let optionButtons = document.getElementById("satellite-manage-trans_step-2_actions_buttons");
        let infoBlock = document.getElementById("satellite-manage-trans_step-2_block");

        manageTransStep1.style.display = "none";
        manageTransStep2.style.display = "block";
        infoBlock.style.display = "block";

        if (response.data.status === "cancelled") {
            optionButtons.style.display = "none";
            document.getElementById("satellite-manage-trans_step-2_block_row_data_status").style.color = "#ea5262";

        } else if (response.data.status === "sent") {
            optionButtons.style.display = "none";
            document.getElementById("satellite-manage-trans_step-2_block_row_data_status").style.color = "green";

        } else if (response.data.status === "transmitting") {
            optionButtons.style.display = "none";
            document.getElementById("satellite-manage-trans_step-2_block_row_data_status").style.color = "green";

        } else if (response.data.status === "pending") {
            optionButtons.style.display = "flex";
            document.getElementById("satellite-manage-trans_step-2_actions_buttons_bump").style.display = "none";
            document.getElementById("satellite-manage-trans_step-2_block_row_data_status").style.color = "#ea5262";

        } else {
            optionButtons.style.display = "flex";
            document.getElementById("satellite-manage-trans_step-2_actions_buttons_delete").style.display = "block";
            document.getElementById("satellite-manage-trans_step-2_actions_buttons_bump").style.display = "block";
            document.getElementById("satellite-manage-trans_step-2_block_row_data_status").style.color = "#ffffff";
        }

    })
    .catch(error => {
        //handle error
        // console.log("delete error: ", error);
        // stay on current screen / add fail message

        bumpError.innerHTML = "Failed.";
        bumpError.style.display = "block";
    });
};



// bump and delete functionality
const deleteTransmissionStep = () => {

    let buttonsContainer = document.getElementById("satellite-manage-trans_step-2_actions_buttons");
    let authCodeContainer = document.getElementById("satellite-manage-trans_step-2_actions_auth-code");

    let finalDeleteButton = document.getElementById("satellite-manage-trans_step-2_actions_auth-code_button_delete"); 
    let bumpSubmitButton = document.getElementById("satellite-manage-trans_step-2_actions_auth-code_button_bump-submit"); 

    buttonsContainer.style.display = "none";
    authCodeContainer.style.display = "block";

    bumpSubmitButton.style.display = "none";
    finalDeleteButton.style.display = "block";
};



const deleteTransmission = async () => {
    // console.log("DELETE - final step");

    let uuid = document.getElementById("satellite-manage-trans_step-1_form_input_uuid").value;
    let authToken = document.getElementById("satellite-manage-trans_step-2_actions_auth-code_input").value;

    let errorField = document.getElementById("satellite-queue_action_manage-transmission_body_error");
    let successField = document.getElementById("satellite-queue_action_manage-transmission_body_success");

    let endpoint = satelliteAPIBaseUrl + "/order/";

    endpoint = endpoint + uuid + "?auth_token=" + authToken;


    let response;
    try {
        // console.log("delete attempt");
        response = await axios.delete(endpoint);
        
        //handle success
        // console.log("delete success: ", response.data);

        // go back to step 1 / display success message
        clearManageTransmissionForm();

        successField.style.display = "block";
        successField.innerHTML = "Transmission Deleted";

        // refresh queue table
        getSatelliteQueueData("queue");


    } catch (err) {
        //handle error
        // console.log(err);
        // stay on current screen / add fail message
        
        errorField.innerHTML = "Failed.";
        errorField.style.display = "block";
        successField.style.display = "none";
    }
};



const bumpTransmissionStep = () => {
    // console.log("bump transmission STEP");

    let buttonsContainer = document.getElementById("satellite-manage-trans_step-2_actions_buttons");
    let authCodeContainer = document.getElementById("satellite-manage-trans_step-2_actions_auth-code");

    let finalDeleteButton = document.getElementById("satellite-manage-trans_step-2_actions_auth-code_button_delete"); 
    let bumpSubmitButton = document.getElementById("satellite-manage-trans_step-2_actions_auth-code_button_bump-submit"); 

    buttonsContainer.style.display = "none";
    authCodeContainer.style.display = "block";

    bumpSubmitButton.style.display = "block";
    finalDeleteButton.style.display = "none";
};



const bumpTransmissionSubmitNewBidPrice = () => {
    // console.log("new bid price submitted");

    // let newBidPrice = document.getElementById("satellite-manage-trans_step-2_actions_new-bid-price_input").value;
    let newBidRate = document.getElementById("satellite-manage-trans_step-2_actions_new-bid-price_input").value;
    let uuid = document.getElementById("satellite-manage-trans_step-1_form_input_uuid").value;
    let authToken = document.getElementById("satellite-manage-trans_step-2_actions_auth-code_input").value;

    let bumpError = document.getElementById("satellite-queue_action_manage-transmission_body_error");

    // need to get the current bid rate - subtract that from the new bid rate and only send the difference increase to the api
    let currentBidRate = parseInt(document.getElementById("satellite-manage-trans_step-2_block_row_data_bid-rate").textContent);

    // console.log("currentBidRate: ", currentBidRate);

    // bid check:
    if (newBidRate <= currentBidRate) {
        bumpError.innerHTML = "Bump Bid Rate must be larger than the current Bid Rate";
        bumpError.style.display = "block";
        return;
    } else if (newBidRate <= 50) {
        bumpError.innerHTML = "Bump Bid Rate must be larger than the minimum Bid Rate";
        bumpError.style.display = "block";
        return;
    }

    let bidIncrease = newBidRate - currentBidRate;

    // console.log("bidIncrease: ", bidIncrease);

    let fileSize = adjustSizeForOverhead(manageTransactionsCurrentFileSize);
    let newBidPrice = Math.ceil(bidIncrease * fileSize);

    let endpoint = satelliteAPIBaseUrl + "/order/";

    endpoint = endpoint + uuid + "/bump";

    let formData = new FormData();
    formData.append("bid_increase", newBidPrice);
    formData.append("auth_token", authToken);

    axios.post(endpoint, formData)
        .then(response => {
            //handle success
            // console.log("bump success: ", response.data);
            // go back to uui input / add success message
            bumpError.style.display = "none";

            // show bitcoin conversion for difference:
            let conversionBTCField = document.getElementById("satellite-manage-trans_step-2_actions_invoice_payment-block_conversion");
            let bumpBTCAmount = (response.data.lightning_invoice.msatoshi / 1000 / 100000000).toFixed(11);
            conversionBTCField.innerHTML = `${bumpBTCAmount} BTC`;


            let paymentAddress = document.getElementById("satellite-manage-trans_step-2_actions_invoice_payment-block_payment-address");
            paymentAddress.innerHTML = response.data.lightning_invoice.payreq;

            // set invoice data
            let qrCodeContainer = document.getElementById("satellite-manage-trans_step-2_actions_invoice_payment-block_qr-code-container");
            qrCodeContainer.innerHTML = "";

            new QRCode(qrCodeContainer, response.data.lightning_invoice.payreq);


            // next - display invoice - no need for the auth code display section
            let sectionNewBidPrice = document.getElementById("satellite-manage-trans_step-2_actions_new-bid-price");
            let sectionInvoice = document.getElementById("satellite-manage-trans_step-2_actions_invoice");
            let transmissionInfoBlock = document.getElementById("satellite-manage-trans_step-2_block");

            transmissionInfoBlock.style.display = "none";
            sectionNewBidPrice.style.display = "none";
            sectionInvoice.style.display = "flex";

        })
        .catch(error => {
            //handle error
            // console.log("bump error: ", error);
            // stay on current screen / add fail message

            bumpError.innerHTML = "Failed.";
            bumpError.style.display = "block";
        });


    
};


const bumpTransmissionSubmitAuthCode = () => {
    // console.log("BUMP TRANSMISSION - auth code submitted");

    let sectionAuthCode = document.getElementById("satellite-manage-trans_step-2_actions_auth-code");
    let sectionNewBidPrice = document.getElementById("satellite-manage-trans_step-2_actions_new-bid-price");

    sectionAuthCode.style.display = "none";
    sectionNewBidPrice.style.display = "block";

};


// clear all fields and redisplay first step - after request is closed out
const clearManageTransmissionForm = () => {
    // console.log("clearManageTransmissionForm executed");

    // remove all steps that could currently be open - fields will be cleared through the next request
    document.getElementById("satellite-manage-trans_step-2").style.display = "none";
    document.getElementById("satellite-manage-trans_step-2_actions_auth-code").style.display = "none";
    document.getElementById("satellite-manage-trans_step-2_actions_new-bid-price").style.display = "none";
    document.getElementById("satellite-manage-trans_step-2_actions_auth-code_button_bump-submit").style.display = "none";
    document.getElementById("satellite-manage-trans_step-2_actions_auth-code_button_delete").style.display = "none";
    document.getElementById("satellite-manage-trans_step-2_actions_invoice").style.display = "none";
    document.getElementById("satellite-queue_action_manage-transmission_body_error").style.display = "none";
    document.getElementById("satellite-queue_action_manage-transmission_body_success").style.display = "none";

    // display first step - clear input field
    document.getElementById("satellite-manage-trans_step-1").style.display = "flex";
    document.getElementById("satellite-manage-trans_step-1_form_input_uuid").value = "";
    document.getElementById("satellite-manage-trans_step-1_form_input_auth-token").value = "";
};


const handleErrorResponse = (errorCode) => {
    let returnMessage = ""

    switch (errorCode) {
        case 102:
            // BID_TOO_SMALL
            returnMessage = "Bid too small. Minimum of 50 millisatoshis per byte.";
            break;
        case 103:
            // FILE_MISSING
            returnMessage = "Error. File missing";
            break;
        case 116:
            // MESSAGE_FILENAME_MISSING
            returnMessage = "Error. Message filename missing.";
            break;
        case 117:
            // MESSAGE_FILE_TOO_SMALL
            returnMessage = "File too small.";
            break;
        case 118:
            // MESSAGE_FILE_TOO_LARGE
            returnMessage = "File too large. Limit of 10kb.";
            break;
        case 125:
            // MESSAGE_TOO_LONG
            returnMessage = "Error. Message too large.";
            break;
        case 126:
            // MESSAGE_MISSING
            returnMessage = "Error. Message missing.";
            break;
        default:
            returnMessage = "Upload Failed.";
            break;
    }

    return returnMessage;
};

const adjustSizeForOverhead = (originalFileSize) => {
    let numberOfFragments = Math.ceil(originalFileSize / maxBlocksatPayload);
    let adjustedFileSize = originalFileSize + (numberOfFragments * overheadL2);

    return adjustedFileSize;
};


const calcBidRateRemoveOverhead = (size, bid) => {

    let adjustedSize = adjustSizeForOverhead(size);
    let bidRate =  bid / adjustedSize;

    return bidRate;
};

const satelliteDeleteFile = () => {
    let fileInputField = document.getElementById("satellite-send-data-file");
    let fileInputLabel = document.getElementById("satellite-send-data-file_label");
    let elFileLabelBlock = document.getElementById("satellite-send-data-file_label_block");
    
    elFileLabelBlock.style.display = "none";
    fileInputField.value = "";
    fileInputLabel.innerHTML = "";
};