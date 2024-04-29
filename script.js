const inputBox = document.getElementById("inputbox");
const validationMessage = document.getElementById("validation-message");

inputBox.addEventListener("change", function(e) {
    const inputValue = inputBox.value;
    const specialCharactersRegex = /[!@#$%^&*(),.?":{}|<>]/;

    if (specialCharactersRegex.test(inputValue)) {
        inputBox.value = "";

        // Show validation message
        validationMessage.textContent = "Special characters are not allowed";
        validationMessage.style.display = "block";

        return;
    }
    // Hide validation message if validation passes
    validationMessage.textContent = "";
    validationMessage.style.display = "none";

    
});


const tableContainer = document.getElementById("table-container");
let editTask = null;

function generateUniqueId() {
    return Math.floor(Math.random() * 10000000);
}

const AddTask = () => {
    if (inputBox.value) {
        let taskArray = localStorage.getItem('tasks');

        if (taskArray) {
            taskArray = JSON.parse(taskArray);
        } else {
            taskArray = [];
        }

        let data = { text: inputBox?.value ?? '', checked: false };

        if (editTask) {
            data = { ...data, id: editTask?.id, checked: editTask?.checked };
            taskArray = taskArray?.map(item => (item?.id === data?.id ? data : item));
        } else {
            data = { ...data, id: generateUniqueId() };
            taskArray = [...taskArray, data];
        }

        editTask = null;
        inputBox.value = '';
        localStorage.setItem('tasks', JSON.stringify(taskArray));
        showTasks();
    } else {
        alert("You must write something!");
    }
};

const showTasks = () => {
    let tasks = localStorage.getItem("tasks");

    // Remove existing tables if any
    document.querySelectorAll("table").forEach(table => table.remove());
    const exportButton = document.querySelector("#export-button");
    if (exportButton) {
        exportButton.remove();
    }

    if (tasks) {
        tasks = JSON.parse(tasks);

        const allTasksTable = createTable(tasks, true, "All Tasks");
        tableContainer.appendChild(allTasksTable);

        const incompleteTasks = tasks.filter(item => !item?.checked);
        const incompleteTasksTable = createTable(incompleteTasks, false, "Incomplete Tasks");
        tableContainer.appendChild(incompleteTasksTable);

        const completeTasks = tasks.filter(item => item?.checked);
        const completeTasksTable = createTable(completeTasks, false, "Complete Tasks");
        tableContainer.appendChild(completeTasksTable);

        const exportButton = document.createElement("button");
        exportButton.setAttribute('id', 'export-button');
        exportButton.textContent = "Export";
        exportButton.addEventListener("click", () => {
            exportToExcel(allTasksTable, "all_tasks.xls");
        });
        tableContainer.appendChild(exportButton);

        return allTasksTable;
    }
};

// Use noConflict to avoid conflicts
var $j = jQuery.noConflict();

function exportToExcel(table, filename) {
    $j(document).ready(function () {
        // Your code that uses $j instead of $
        $j(table).table2excel({
            filename: filename,
            name: "Worksheet",
            sheet: {
                name: "Sheet 1"
            }
        });
    });
}

function createTable(tasks, isAllowCrud = true, tableName = "") {
    const table = document.createElement("table");
    table.classList.add("custom-table");

    const headerRow = table.insertRow();
    let columnsArray = !isAllowCrud ? ["ToDo's List", "Complete"] : ["ToDo's List", "Edit", "Delete", "Complete"];
    columnsArray.forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    tasks.forEach(item => {
        const row = table.insertRow();

        const nameColumn = row.insertCell();
        nameColumn.textContent = item?.text;

        if (isAllowCrud) {

            // edit icon logic 
            const editColumn = row.insertCell();
            const editLink = document.createElement("span");
            editLink.className = "fas fa-edit cursor";
            editLink.addEventListener("click", () => {
                let inputElement = document.getElementById("inputbox");
                inputElement.value = item?.text;
                editTask = item;
            });
            editColumn.appendChild(editLink);

            // delete icon logic
            const deleteColumn = row.insertCell();
            const deleteLink = document.createElement("span");
            deleteLink.className = "fas fa-trash cursor";
            deleteLink.addEventListener('click', () => {
                if (window.confirm('Are you sure you want to delete this Task?')) {
                    let taskArray = localStorage.getItem('tasks');
                    taskArray = JSON.parse(taskArray);

                    taskArray = taskArray.filter(data => data.id !== item.id);
                    localStorage.setItem('tasks', JSON.stringify(taskArray));
                    showTasks();
                    editTask = null;
                    inputBox.value = '';
                }
            });
            deleteColumn.appendChild(deleteLink);
        }

        // Complete icon Logic
        const completeColumn = row.insertCell();
        const completeCheckbox = document.createElement("input");
        completeCheckbox.type = "checkbox";
        completeCheckbox.checked = item?.checked || false;
        completeCheckbox.addEventListener("change", () => {
            item.checked = completeCheckbox.checked;
            localStorage.setItem("tasks", JSON.stringify(tasks));
            showTasks();
        });
        completeColumn.appendChild(completeCheckbox);
    });

    const caption = table.createCaption();
    caption.textContent = tableName;

    return table;
}

showTasks();

