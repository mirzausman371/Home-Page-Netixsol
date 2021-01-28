// globals
let refreshRotated = 0;
let currentTopBidRate = 50;
let satelliteAPIBaseUrl = "https://api.NetixSol.space";
let earliestSentRecord = new Date(Date.now());
earliestSentRecord = earliestSentRecord.toISOString();



const refreshTable = () => {

    refreshRotated += 360;

    let refreshButton = document.querySelector(".satellite-queue_table-selection_container_refresh_button");
    refreshButton.style.transform = `rotate(${refreshRotated}deg)`;

    getSatelliteQueueData("queue");
    getSatelliteQueueData("sent");
    getSatelliteQueueData("pending");
};

const getSatelliteQueueData = async (tableToUpdate) => {

    // console.log("UPDATE - ", tableToUpdate);

    let endpoint;
    let tableElement;
    let params = {};

    switch (tableToUpdate) {
        case "queue":
            endpoint = satelliteAPIBaseUrl + "/orders/queued";
            tableElement = document.getElementById("satellite-queue_table-queue");
            params.limit = 20;
            break;
        case "sent":
            endpoint = satelliteAPIBaseUrl + "/orders/sent";
            tableElement = document.getElementById("satellite-queue_table-sent");
            break;
        case "pending":
            endpoint = satelliteAPIBaseUrl + "/orders/pending";
            tableElement = document.getElementById("satellite-queue_table-pending");
            break;
        default:
            endpoint = satelliteAPIBaseUrl + "/orders/queued";
            tableElement = document.getElementById("satellite-queue_table-queue");
            break;
    }

    let response;
    let data;

    try {
        response = await axios.get(endpoint, { params: params });
        data = response.data;
        // console.log(data);
    } catch (err) {
        // console.log("error: ", err);
    }

    // clear the tables first -- setting only the headers
    tableElement.innerHTML = "<div class='satellite-queue_table_header'><div class='satellite-queue_table_header_item satellite-queue_table_header_item-large'>Created</div><div class='satellite-queue_table_header_item satellite-queue_table_header_item-xlarge'>Transmission ID</div><div class='satellite-queue_table_header_item satellite-queue_table_header_item-medium' style='justify-content: center;'>Bid/Byte (mSat)</div><div class='satellite-queue_table_header_item satellite-queue_table_header_item-medium' style='justify-content: center;'>Message Size</div><div class='satellite-queue_table_header_item satellite-queue_table_header_item-small' style='justify-content: center;'>Status</div><div class='satellite-queue_table_header_item satellite-queue_table_header_item-tiny' style='justify-content: flex-end;'></div></div>";

    // transmitting row should always be first
    let transmittingRow;

    data.forEach((el) => {
        let newRow = document.createElement("div");
        let newRowStatus = el.status;

        let createdDateFormatted = new Date(el.created_at);
        createdDateFormatted = createdDateFormatted.toLocaleString();

        let uploadStartedFormatted = "";
        let uploadEndedFormatted = "";

        // update the highest bid price -- this needs to be isolated to pick only from the queued items - not sent**
        if (el.status === "paid" && el.bid_per_byte > currentTopBidRate) {
            currentTopBidRate = el.bid_per_byte;
        }

        if (el.started_transmission_at) {
            uploadStartedFormatted = new Date(el.started_transmission_at);
            uploadStartedFormatted = uploadStartedFormatted.toLocaleString();
        }

        if (el.ended_transmission_at) {
            uploadEndedFormatted = new Date(el.ended_transmission_at);
            uploadEndedFormatted = uploadEndedFormatted.toLocaleString();
        }

        // find the earliest date for sent records
        if (el.status === "sent") {
            if (el.created_at < earliestSentRecord) {
                earliestSentRecord = el.created_at;
            }
        }

        // change status labels:
        let statusLabel;
        if (el.status === "paid") {
            statusLabel = "queued";
        } else {
            statusLabel = el.status;
        }

        let adjustedBidRate = calcBidRateRemoveOverhead(el.message_size, el.bid);
        let adjustedSize = adjustSizeForOverhead(el.message_size);

        console.log("====");
        console.log("el.bid_per_byte: ", el.bid_per_byte);
        console.log("el.message_size: ", el.message_size);
        console.log("el.bid: ", el.bid);

        console.log("adjustedBidRate: ", adjustedBidRate);

        // adjust file size to remove overhead

        // adjust bid amount according to
        console.log("====");

        // loading bar for transmitting items
        let transmittingSpinner = "<div class='satellite-queue_transmitting-spinner'></div>"

        newRow.setAttribute("class", "satellite-queue_table_row");

        newRow.innerHTML =  "<div class='satellite-queue_table_row_collapsed'>" +
                            "<div class='satellite-queue_table_row_collapsed_cell_wrapper'><div class='satellite-queue_table_row_collapsed_cell_title'>Created</div><div class='satellite-queue_table_row_collapsed_cell satellite-queue_table_row_cell-large'>" + createdDateFormatted +
                            "</div></div><div class='satellite-queue_table_row_collapsed_cell_wrapper'><div class='satellite-queue_table_row_collapsed_cell_title'>Transmission ID</div><div class='satellite-queue_table_row_collapsed_cell satellite-queue_table_row_cell-xlarge'>" + el.uuid +
                            "</div></div><div class='satellite-queue_table_row_collapsed_cell_wrapper'><div class='satellite-queue_table_row_collapsed_cell_title'>" + ( tableToUpdate === "pending" ? "Bid/Byte (mSat)" : "Bid (mSat)") + "</div><div class='satellite-queue_table_row_collapsed_cell satellite-queue_table_row_cell-medium' style='justify-content: center;'>" + ( tableToUpdate === "pending" ? Math.floor((el.bid_per_byte + el.unpaid_bid) / adjustedSize) : Math.ceil(adjustedBidRate) ) +
                            "</div></div><div class='satellite-queue_table_row_collapsed_cell_wrapper'><div class='satellite-queue_table_row_collapsed_cell_title'>Message Size</div><div class='satellite-queue_table_row_collapsed_cell satellite-queue_table_row_cell-medium' style='justify-content: center;'>" + el.message_size +
                            "</div></div><div class='satellite-queue_table_row_collapsed_cell_wrapper'><div class='satellite-queue_table_row_collapsed_cell_title'>Status</div><div class='satellite-queue_table_row_collapsed_cell satellite-queue_table_row_cell-small' style='justify-content: center;'>" + ( el.status === "transmitting" ? transmittingSpinner : statusLabel )  +
                            "</div></div><div class='satellite-queue_table_row_collapsed_cell satellite-queue_table_row_cell-tiny' style='justify-content: flex-end;'>" + (uploadStartedFormatted !== "" ? "<i class='fal fa-ellipsis-v satellite-queue_table_row_cell_expand' onclick='expandRow(event)'></i>" : "") + "</div>" +
                            "</div>" +
                            "<div class='satellite-queue_table_row_expanded'>" +
                            "<div class='satellite-queue_table_row_expanded_cell satellite-queue_table_row_cell-large'>" + createdDateFormatted +
                            "</div><div class='satellite-queue_table_row_expanded_cell satellite-queue_table_row_cell-xlarge'>" + el.uuid +
                            "</div><div class='satellite-queue_table_row_expanded_cell satellite-queue_table_row_cell-medium' style='justify-content: center;'>" + Math.ceil(adjustedBidRate) +
                            "</div><div class='satellite-queue_table_row_expanded_cell satellite-queue_table_row_cell-medium' style='justify-content: center;'>" + el.message_size +
                            "</div><div class='satellite-queue_table_row_expanded_cell satellite-queue_table_row_cell-small' style='justify-content: center;'>" + ( el.status === "transmitting" ? transmittingSpinner : statusLabel ) +
                            "</div><div class='satellite-queue_table_row_expanded_cell satellite-queue_table_row_cell-tiny' style='justify-content: flex-end;'><i class='fal fa-ellipsis-v satellite-queue_table_row_cell_expand' onclick='collapseRow(event)'></i></div>" +
                            "<div class='satellite-queue_table_row_expanded_cell satellite-queue_table_row_expanded_cell_upload-container'>" +
                            "<div " + ( uploadStartedFormatted === "" ? "style='display: none'" : "") + " class='satellite-queue_table_row_expanded_cell_upload-container_row'><div class='satellite-queue_table_row_expanded_cell_upload-container_row_title'>Upload Started:</div><div class='satellite-queue_table_row_expanded_cell_upload-container_row_data'>" + uploadStartedFormatted +
                            "</div></div>" +
                            "<div " + ( uploadEndedFormatted === "" ? "style='display: none'" : "") + " class='satellite-queue_table_row_expanded_cell_upload-container_row'><div class='satellite-queue_table_row_expanded_cell_upload-container_row_title'>Upload Ended:</div><div class='satellite-queue_table_row_expanded_cell_upload-container_row_data'>" + uploadEndedFormatted + "</div></div></div>" +
                            "</div>";


        if (el.status === "transmitting") {
            transmittingRow = newRow;
        } else {
            tableElement.appendChild(newRow);
        }

    });

    // insert the transmitting row at the very beginning of the table
    if (transmittingRow) {
        if (tableElement.childNodes[1]) {
            tableElement.insertBefore(transmittingRow, tableElement.childNodes[1]);
        } else {
            tableElement.appendChild(transmittingRow);
        }
    }


    // put placeholder row if no data is found
    if (data.length === 0) {
        let emptyRow = document.createElement("div");
        emptyRow.setAttribute("class", "satellite-queue_table_row");

        emptyRow.innerHTML = "<div class='satellite-queue_table_row_collapsed'><div class='satellite-queue_table_row_collapsed_cell satellite-queue_table_row_cell-full-span'>" + "All transmissions have been sent." + "</div></div>";

        tableElement.appendChild(emptyRow);
    }


    // start spinner for any transmitting items
    startAllTransmittingSpinners();
};


const expandRow = (event) => {
    let row = event.target.parentNode.parentNode;

    row.style.display = "none";
    row.nextSibling.style.display = "flex";
};

const collapseRow = (event) => {
    let row = event.target.parentNode.parentNode;

    row.style.display = "none";
    row.previousSibling.style.display = "flex";
};


// needs to be async as we need to wait for the (sent) table to be populated to get an accurate record count for show more button
const tableSelection = async (tableToDisplay) => {

    let queueTable = document.getElementById("satellite-queue_table-queue");
    let sentTable = document.getElementById("satellite-queue_table-sent");
    let pendingTable = document.getElementById("satellite-queue_table-pending");

    let showMoreButton = document.getElementById("satellite-queue_more");

    let queueTableSelect = document.getElementById("satellite-queue_table-selection_queue");
    let sentTableSelect = document.getElementById("satellite-queue_table-selection_sent");
    let pendingTableSelect = document.getElementById("satellite-queue_table-selection_pending");

    switch (tableToDisplay) {
        case "queue":
            getSatelliteQueueData("queue");

            queueTable.style.display = "block";
            queueTableSelect.classList.add("satellite-queue_table-selection_table-active");

            sentTable.style.display = "none";
            sentTableSelect.classList.remove("satellite-queue_table-selection_table-active");

            pendingTable.style.display = "none";
            pendingTableSelect.classList.remove("satellite-queue_table-selection_table-active");

            showMoreButton.style.display = "none";
            break;

        case "sent":
            await getSatelliteQueueData("sent");

            queueTable.style.display = "none";
            queueTableSelect.classList.remove("satellite-queue_table-selection_table-active");

            sentTable.style.display = "block";
            sentTableSelect.classList.add("satellite-queue_table-selection_table-active");

            pendingTable.style.display = "none";
            pendingTableSelect.classList.remove("satellite-queue_table-selection_table-active");

            // only show show more button if there are 20 or more transactions - remember the first record is always the header
            let sentRecordsCount = document.getElementById("satellite-queue_table-sent").childElementCount;
            if (sentRecordsCount >= 20) {
                showMoreButton.style.display = "block";
            } else {
                showMoreButton.style.display = "none";
            }
            break;

        case "pending":
            getSatelliteQueueData("pending");

            queueTable.style.display = "none";
            queueTableSelect.classList.remove("satellite-queue_table-selection_table-active");

            sentTable.style.display = "none";
            sentTableSelect.classList.remove("satellite-queue_table-selection_table-active");

            pendingTable.style.display = "block";
            pendingTableSelect.classList.add("satellite-queue_table-selection_table-active");

            showMoreButton.style.display = "none";
            break;

        default:
            return;
    }
};


// no longer needed -- ?
// bump functionality:
// const bumpTransaction = (e) => {

//     // expand the row:
//     let selectedRow = e.target.parentNode.parentNode;
//     selectedRow.style.height = "60rem";

//     selectedRow.childNodes.forEach((el, index) => {
//         if (index <= 5) {
//             el.style.height = "60rem";
//         }
//     });
// };

// no longer needed -- ?
// const deleteTransaction = (e) => {

//     // expand the row:
//     let selectedRow = e.target.parentNode.parentNode;
//     selectedRow.style.height = "70rem";

//     selectedRow.childNodes.forEach((el, index) => {
//         if (index <= 5) {
//             el.style.height = "70rem";
//         }
//     });

//     let authTokenPromptDiv = document.createElement("div");
//     authTokenPromptDiv.innerHTML = "<div class='auth-token-prompt_backdrop' id='auth-token-prompt_backdrop' onclick='closeModal(event)'><div class='auth-token-prompt' id='auth-token-prompt_modal'><div class='auth-token-prompt_title'>Enter your UUID</div><textarea class='auth-token-prompt_auth-code' id='auth-token-prompt_uuid'></textarea><div class='auth-token-prompt_title'>Enter your Authentication Token</div><textarea class='auth-token-prompt_auth-code' id='auth-token-prompt_token'></textarea><button class='auth-token-prompt_button' onclick='deleteQueueRecord()'>Submit</button></div></div>";

//     selectedRow.appendChild(authTokenPromptDiv);
// };

// const deleteQueueRecord = async () => {

//     // api call to delete that record
//     let endpoint = "http://satellite.NetixSol.com/api/order";
//     let authToken = document.getElementById("auth-token-prompt_token").value;
//     let uuid = document.getElementById("auth-token-prompt_uuid").value;
//     let response;
//     let data;

//     if (uuid) {
//         endpoint = endpoint + "/" + uuid;
//         console.log(endpoint);
//     }

//     // need the uuid to make the delete request... need to get this in the orders call to add as a hidden field on the table..
//     await axios.delete(endpoint, {auth_token: authToken})
//     .then(function (response) {
//         //handle success
//         console.log(response);
//     })
//     .catch(function (error) {
//         //handle error
//         console.log(error);
//     });
// };

const closeModal = (e) => {

    if (e.target.id !== "auth-token-prompt_backdrop") {
        return;
    }

    let modal = document.getElementById("auth-token-prompt_backdrop");
    let row = e.target.parentNode;

    row.removeChild(modal);

    // hide expanded row
    row.parentNode.style.height = "18rem";
    row.parentNode.style.display = "none";

    // show collapsed row
    row.parentNode.previousSibling.style.display = "flex";
};


// pick up all transmitting spinners and start them
const startAllTransmittingSpinners = () => {
    let transmittingElements = document.querySelectorAll(".satellite-queue_transmitting-spinner");

    transmittingElements.forEach(el => {
        startSpinner(el);
    });
};

// start an individual spinner
const startSpinner = (element) => {
    let width = 1;
    setInterval(frame, 10);

    function frame() {
        if (width >= 100) {
            width = 0;
        } else {
            width++;
            element.style.width = width + '%';
        }
    };
};


const satelliteSentShowMoreRecords = async () => {
    // console.log("show more clicked");

    endpoint = satelliteAPIBaseUrl + "/orders/sent";
    tableElement = document.getElementById("satellite-queue_table-sent");


    // get next set of 20 records that were sent before the earliest record of the previous set
    let params = {
        before: earliestSentRecord
    };

    try {
        let response = await axios.get(endpoint, { params: params });
        data = response.data;
        // console.log(data);
    } catch (err) {
        // console.log("error: ", err);
    }


    data.forEach((el) => {
        let newRow = document.createElement("div");

        let createdDateFormatted = new Date(el.created_at);
        createdDateFormatted = createdDateFormatted.toLocaleString();

        let uploadStartedFormatted = "";
        let uploadEndedFormatted = "";


        if (el.started_transmission_at) {
            uploadStartedFormatted = new Date(el.started_transmission_at);
            uploadStartedFormatted = uploadStartedFormatted.toLocaleString();
        }

        if (el.ended_transmission_at) {
            uploadEndedFormatted = new Date(el.ended_transmission_at);
            uploadEndedFormatted = uploadEndedFormatted.toLocaleString();
        }

        // find the earliest date for sent records
        if (el.status === "sent") {
            if (el.created_at < earliestSentRecord) {
                earliestSentRecord = el.created_at;
            }
        }

        // change status labels:
        let statusLabel;
        if (el.status === "paid") {
            statusLabel = "queued";
        } else {
            statusLabel = el.status;
        }

        let adjustedBidRate = calcBidRateRemoveOverhead(el.message_size, el.bid);

        // loading bar for transmitting items
        let transmittingSpinner = "<div class='satellite-queue_transmitting-spinner'></div>"

        newRow.setAttribute("class", "satellite-queue_table_row");

        newRow.innerHTML =  "<div class='satellite-queue_table_row_collapsed'>" +
                            "<div class='satellite-queue_table_row_collapsed_cell satellite-queue_table_row_cell-large'>" + createdDateFormatted +
                            "</div><div class='satellite-queue_table_row_collapsed_cell satellite-queue_table_row_cell-xlarge'>" + el.uuid +
                            "</div><div class='satellite-queue_table_row_collapsed_cell satellite-queue_table_row_cell-medium' style='justify-content: center;'>" + Math.ceil(adjustedBidRate) +
                            "</div><div class='satellite-queue_table_row_collapsed_cell satellite-queue_table_row_cell-medium' style='justify-content: center;'>" + el.message_size +
                            "</div><div class='satellite-queue_table_row_collapsed_cell satellite-queue_table_row_cell-small' style='justify-content: center;'>" + ( el.status === "transmitting" ? transmittingSpinner : statusLabel )  +
                            "</div><div class='satellite-queue_table_row_collapsed_cell satellite-queue_table_row_cell-tiny' style='justify-content: flex-end;'>" + (uploadStartedFormatted !== "" ? "<i class='fal fa-ellipsis-v satellite-queue_table_row_cell_expand' onclick='expandRow(event)'></i>" : "") + "</div>" +
                            "</div>" +
                            "<div class='satellite-queue_table_row_expanded'>" +
                            "<div class='satellite-queue_table_row_expanded_cell satellite-queue_table_row_cell-large'>" + createdDateFormatted +
                            "</div><div class='satellite-queue_table_row_expanded_cell satellite-queue_table_row_cell-xlarge'>" + el.uuid +
                            "</div><div class='satellite-queue_table_row_expanded_cell satellite-queue_table_row_cell-medium' style='justify-content: center;'>" + Math.ceil(adjustedBidRate) +
                            "</div><div class='satellite-queue_table_row_expanded_cell satellite-queue_table_row_cell-medium' style='justify-content: center;'>" + el.message_size +
                            "</div><div class='satellite-queue_table_row_expanded_cell satellite-queue_table_row_cell-small' style='justify-content: center;'>" + ( el.status === "transmitting" ? transmittingSpinner : statusLabel ) +
                            "</div><div class='satellite-queue_table_row_expanded_cell satellite-queue_table_row_cell-tiny' style='justify-content: flex-end;'><i class='fal fa-ellipsis-v satellite-queue_table_row_cell_expand' onclick='collapseRow(event)'></i></div>" +
                            "<div class='satellite-queue_table_row_expanded_cell satellite-queue_table_row_expanded_cell_upload-container'>" +
                            "<div " + ( uploadStartedFormatted === "" ? "style='display: none'" : "") + " class='satellite-queue_table_row_expanded_cell_upload-container_row'><div class='satellite-queue_table_row_expanded_cell_upload-container_row_title'>Upload Started:</div><div class='satellite-queue_table_row_expanded_cell_upload-container_row_data'>" + uploadStartedFormatted +
                            "</div></div>" +
                            "<div " + ( uploadEndedFormatted === "" ? "style='display: none'" : "") + " class='satellite-queue_table_row_expanded_cell_upload-container_row'><div class='satellite-queue_table_row_expanded_cell_upload-container_row_title'>Upload Ended:</div><div class='satellite-queue_table_row_expanded_cell_upload-container_row_data'>" + uploadEndedFormatted + "</div></div></div>" +
                            "</div>";

        tableElement.appendChild(newRow);

    });


    // check how many records were pulled -- if less than 20 - hide the more button
    let showMoreButton = document.getElementById("satellite-queue_more");
    let newRecordsCount = data.length;
    // console.log("number of new records: ", newRecordsCount);

    if (newRecordsCount >= 20) {
        showMoreButton.style.display = "block";
    } else {
        showMoreButton.style.display = "none";
    }

};


getSatelliteQueueData("sent");