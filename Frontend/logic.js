const textItem = document.getElementById("taskInput");
const taskTableBody = document.getElementById("taskTableBody");
const taskTable = document.getElementById("taskTable");
// let dataLoaded = false;
let validation = false;
localStorage.getItem("objectCountStorage");
let task;
let sidebarOpen = false;

baseURL = "http://localhost:3000";

// Simulates creating a getting data at certain time spans
// const intervalTestdata = setInterval(createTestData, 10000);
// const intervalGetdata = setInterval(getData, 11000);

// retrieve data from the database and creates UI based off that data
async function getData() {
    const url = baseURL + "/tasks";
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
  
      const result = await response.json();
      populateAPIData(result);
      console.log(result);
    } catch (error) {
      console.error(error.message);
    }
}

function populateAPIData(result){
    // console.log(result[0]);
    // if (dataLoaded == true) {
    //     console.log('Data already loaded');
    //     alert('Data Already Loaded!');
    //     return;
    // }

    taskTableBody.innerHTML = '';

    Object.values(result).forEach(value => {
        console.log(value);
        console.log(value.ID);
        // console.log(value.TASKS);
        // console.log(value.STATUS);
        // console.log(value.DONE);
        saveNewRowAPI(value);
        // dataLoaded = true
    })
    // console.log(jsObjects);
    return;
}

async function updateCheckBox(checkBoxElement) {
    
    if (checkBoxElement.checked === true){
        const parentRow = checkBoxElement.closest(".tableRow");
        const parentRowElement = parentRow.id
        const parentRowID = parentRowElement.substring(6);
        console.log(parentRowID);

        const statusCell = document.getElementById('cell-' + parentRowID + '-2');
        statusCell.textContent = 'Task Completed';

        updateRecord("DONE", "1", parentRowID);
        updateRecord("STATUS", "Task Completed", parentRowID);
    }
    else if (checkBoxElement.checked === false){
        const parentRow = checkBoxElement.closest(".tableRow");
        const parentRowElement = parentRow.id
        const parentRowID = parentRowElement.substring(6);
        console.log(parentRowID);

        const statusCell = document.getElementById('cell-' + parentRowID + '-2');
        statusCell.textContent = 'Not Done';

        updateRecord("DONE", "0", parentRowID);
        updateRecord("STATUS", "Not Done", parentRowID);
    }
    else{
        console.log("Nothing Happening, CheckBox in weird state?");
    }
    return;
}

async function updateRecord(field, value, ID) {

    const url = baseURL + "/change";
    const updateData = {
        field: field,
        value: value,
        ID: ID
    }
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok){
            const errorData = await response.json();
            throw new Error(`Server error: ${response.status} - ${errorData.error}`);s
        }
    }catch(error){
        console.error(error.message);
    }

}

async function deleteRecord(element){
    const parentRow = element.closest(".tableRow");
    const parentRowElement = parentRow.id
    const parentRowID = parentRowElement.substring(6);
    const url = baseURL + "/removeSingleTask/" + parentRowID;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
        });
    
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Server error: ${response.status} - ${errorData.error}`);
        }

        const result = await response.json();
        console.log(result);
        parentRow.remove();
        // this.closest("tr").remove(); // removes nearest row element
        // this.parentElement.remove(); removes parent element, which would be the <td>
    } catch (error) {
      console.error(error.message);
    }
}

async function deleteAllRecords(){
    
    const url = baseURL + "/removeTasks";
    try {
      console.log(url);
      const response = await fetch(url, {
        method: "DELETE"
      });

      // Check for successful response
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const result = await response.json();
      console.log(result);

      location.reload();
    } catch (error) {
      console.error(error.message);
    }
}

function createValAlert(mainElement, text){
    let alertDiv = document.createElement("div")
    alertDiv.setAttribute("class", "formAlert");

    let alertText = document.createTextNode(text);

    alertDiv.appendChild(alertText);
    return alertDiv;
}

// Add data to the database
async function postData() {

    if(textItem.value === '') {
        if (validation === false) {
            const mainForm = document.getElementsByClassName("mainForm")[0];
            let alertDiv = createValAlert(mainForm, "Form Data Empty: Please Input a Task Name!");
            mainForm.appendChild(alertDiv);
            validation = true;
        }
        else {
            console.log("validation already hit")
        }
    }
    else {
        const url = baseURL + "/add";

        const newTask = {
            task: textItem.value,
            status: 'Not Done',
            done: 0
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTask)
            });
        
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Server error: ${response.status} - ${errorData.error}`);
            }

            const result = await response.json();
            console.log(result);

            location.reload();
        } catch (error) {
        console.error(error.message);
        }
    }
}

// Used with the create test data button
async function createTestData(){
    const url = baseURL + "/add";

    for (let i = 0; i < 1; i++){
        const newTask = {
            task: 'test-' + Math.round(Math.random() * 100000) ,
            status: 'Not Done',
            done: 0
        }
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTask)
            });
        
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Server error: ${response.status} - ${errorData.error}`);
            }
    
            const result = await response.json();
            console.log(result);
        } catch (error) {
          console.error(error.message);
        }
    }
    // Reloads page
    return(location.reload());
}

// Main handler for creating tables from API data
function saveNewRowAPI(result) {
    let newRow = createNewTableRowAPI(result);
    newRow.className = 'tableRow';
    taskTableBody.appendChild(newRow);
}

function createNewTableRowAPI(result) {
    let newRow = document.createElement("tr");
    newRow.id = "Record" + result.ID;

    let newcell = document.createElement("td");
    newcell.id = "cell-" + result.ID + "-1";
    newcell.className = "newCell";

    let newcell2 = document.createElement("td");
    newcell2.id = "cell-" + result.ID + "-2";
    newcell2.className = "newCell";

    let newcell3 = document.createElement("td");
    newcell3.id = "cell-" + result.ID + "-3";
    newcell3.className = "newCell";

    let newcell4 = document.createElement("td");
    newcell4.id = "cell-" + result.ID + "-4";
    newcell4.className = "newCell";

    let newcell5 = document.createElement("td");
    newcell5.id = "cell-" + result.ID + "-5";
    newcell5.className = "newCell";

    setNewCellValuesAPI(result, newcell, newcell2, newcell3, newcell4, newcell5);
    appendNewCells(newRow, newcell, newcell2, newcell3, newcell4, newcell5);
    return newRow;
}

function appendNewCells(newRow, newcell, newcell2, newcell3, newcell4, newcell5) 
{
    console.log("Appending new cells");
    newRow.appendChild(newcell);
    newRow.appendChild(newcell2);
    newRow.appendChild(newcell3);
    newRow.appendChild(newcell4);
    newRow.appendChild(newcell5);
    return 'true';
}

function setNewCellValuesAPI(result, newcell, newcell2, newcell3, newcell4, newcell5) {
    newcell.textContent = result.TASKS;
    newcell2.textContent = result.STATUS;

    const checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("class", "taskCheckBox");
    checkbox.setAttribute("onClick", "updateCheckBox(this)")
    if (result.DONE === 0){
        checkbox.checked = false;
    }
    else if (result.DONE === 1){
        checkbox.checked = true;
    }
    newcell3.appendChild(checkbox);

    let deleteButton = createDeleteButton("Record" + result.ID);
    newcell4.appendChild(deleteButton);

    // let collapseButton = document.createElement("button")
    // collapseButton.setAttribute('class', 'collapseButton');
    // collapseButton.textContent = "<";
    // collapseButton.setAttribute('onclick', 'toggleRow(this)');
    // newcell5.appendChild(collapseButton)

    return 'true';
}

function createDeleteButton(recordId){

    let deleteButton = document.createElement("button");
    deleteButton.setAttribute("class", "deleteRecord");
    deleteButton.setAttribute("onclick", "deleteRecord(this)")
    deleteButton.textContent = "Delete";

    return deleteButton;
}

// Set the value of the text area box, if there's a value in local storage
function setTaskInput() {
    task = textItem.value;
}

let tableHeader = document.querySelectorAll(".tableHead");

tableHeader.forEach(item => {
    item.addEventListener("click", function() {
        console.log("CollapsingHeader");
        item.classList.remove("tableHead");
        item.classList.add("tableHeadCollapsed");
    });
});

let tableHeaderHidden = document.querySelectorAll(".tableHeadCollapsed");

tableHeaderHidden.forEach(item => {
    item.addEventListener("click", function() {
        console.log("ExpandingHeader");
        item.classList.remove("tableHeadCollapsed");
        item.classList.add("tableHead");
        
    });
});

function toggleRow(button) {
    console.log("Collapsing Row")
    let row = button.closest(".tableRow");
    row.classList.add("tableRowCollapsed");
    row.classList.remove("tableRow");
}

let sidebarButton = document.getElementById("sidebarButton");
let sidebar = document.getElementById("sidebar");

sidebarButton.addEventListener('click', () => {
    console.log('toggling sidebar');

    let sidebarContent = document.getElementById("sidebarContent");

    if (sidebarOpen === false) {
        sidebarContent.setAttribute("class", "sidebarContentsOpened");
        sidebar.classList.toggle('active');
        sidebarButton.classList.toggle('active')
        sidebarOpen = true;
    }
    else if (sidebarOpen === true) {
        sidebarContent.setAttribute("class", "sidebarContentsClosed");
        sidebar.classList.toggle('active');
        sidebarButton.classList.toggle('active')
        sidebarOpen = false;
    }
    
});

dragElement(document.getElementById('bsDiv'));

function dragElement(elm) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elm.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4= e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elm.style.top = (elm.offsetTop - pos2) + "px";
        elm.style.left = (elm.offsetLeft - pos1) + "px";
      }
    
    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
      }
}


// let objectCountStorage;
// if (localStorage.getItem("objectCountStorage") == null) {
//     objectCountStorage = 0;
// }
// else {
//     objectCountStorage = parseInt(localStorage.getItem("objectCountStorage"));
// }

// function getDataOnLoad() {
//     console.log('Getting Data');
//     for (let i = 0; i < localStorage.length; i++){
//         const key = localStorage.key(i);
//         if (key && key.startsWith("Record")) {
//             let record = JSON.parse(localStorage.getItem(key));
//             if (record && record.Task){
//                 let newRow = createNewTableRow(objectCountStorage, false, false, empty);
//                 newRow.className = 'tableRow';
//                 taskTableBody.appendChild(newRow);
//                 console.log("Row created from local");
//             }
//             else {
//                 console.log('record not valid');
//             }
//         }
//     }
// }

// function saveNewRow() {
//     if (textItem.value === null)
//     {
//         console.log("No text to save");
//     } 
//     else if (textItem.value.length > 0) {
//         // setting metrics for row counting and current task item
//         objectCountStorage += 1
//         localStorage.setItem("objectCountStorage", objectCountStorage);
//         localStorage.setItem("task", textItem.value);

//         let newRow = createNewTableRow(objectCountStorage, true, false, empty);
//         newRow.className = 'tableRow';

//         taskTableBody.appendChild(newRow);


//         console.log("Object count: " + objectCountStorage);
        
//         console.log("updated");
//     } else {
//         console.log("No text to save"); 
//     }
// }

// function createNewTableRow(objectCountStorage, newRecord, APIRecord, result)
// {
//         let newRow = document.createElement("tr");
//         newRow.id = "Record" + objectCountStorage;

//         let newcell = document.createElement("td");
//         newcell.id = "cell-" + objectCountStorage + "-1";
//         newcell.className = "newCell";

//         let newcell2 = document.createElement("td");
//         newcell2.id = "cell-" + objectCountStorage + "-2";
//         newcell2.className = "newCell";

//         let newcell3 = document.createElement("td");
//         newcell3.id = "cell-" + objectCountStorage + "-3";
//         newcell3.className = "newCell";

//         let newcell4 = document.createElement("td");
//         newcell4.id = "cell-" + objectCountStorage + "-4";
//         newcell4.className = "newCell";

//         if (APIRecord == true){

//         }
//         else {
//             setNewCellValues(newcell, newcell2, newcell3, newcell4, objectCountStorage);
//         }

//         appendNewCells(newRow, newcell, newcell2, newcell3, newcell4);
//         if (newRecord == true) {
//             setNewLocalRecord(newRow, newcell, newcell2, newcell3, newcell4, objectCountStorage)
//             console.log("New record");
//         }
//         else {
//             console.log("Old record");
//         }
//         return newRow;
// }

// function setNewCellValues(newCell, newcell2, newcell3, newcell4, objectCountStorage) 
// {
//     newCell.textContent = textItem.value;
//     newcell2.textContent = Date.UTC().toString();
//     newcell3.appendChild(document.createElement("input")).setAttribute("type", "checkbox");

//     let deleteButton = createDeleteButton("Record" + objectCountStorage);
//     newcell4.appendChild(deleteButton);

//     return 'true';
// }

// function setNewLocalRecord(newRow, newcell, newcell2, newcell3, newcell4, objectCount)
// {
//     const newRecord = 
//     {
//         row: objectCount,
//         Task: newcell.textContent,
//         Status: newcell2.textContent,
//         Done: null,
//         Delete: null
//     }

//     const newRecordAsString = JSON.stringify(newRecord);
//     localStorage.setItem('Record' + objectCount, newRecordAsString);
// }

