"use strict";

let d = new Date();
let tasks = {};

document.getElementById("year").innerHTML = d.getFullYear();

function retrieveSaved(key) {
    let tasks = JSON.parse(localStorage.getItem(key));
    if (tasks) {return tasks};
    return {};
};

function saveItem(key, item) {
    localStorage.setItem(key, JSON.stringify(item));
};

function removeTask(taskId) {
    event.preventDefault();
    tasks = retrieveSaved("tasks");
    let task = tasks[taskId];
    if (compareObject(task, {})) {
        let notice = `Selected task not found. Please choose a valid task from list of saved tasks.`;
        return document.getElementById("noticeBoard").innerHTML = notice;
    } else {
        let stats = retrieveSaved("task-stat");
        let notice = `Selected task deleted. You can still add more tasks if you wish.`;
        if (task.status.toLowerCase() == "done") {
            stats.completed -= 1;
            stats.deleted += 1;
        } else {
            stats.uncompleted -= 1;
            stats.deleted += 1;
        };
        delete tasks[taskId];
        saveItem("tasks", tasks);
        saveItem("task-stat", stats);
        updateDataTables();
        return document.getElementById("noticeBoard").innerHTML = notice;
    };
};

function populateUpdateFields(taskId) {
    event.preventDefault();
    let task = retrieveSaved("tasks")[taskId];
    if (compareObject(task, {})) {
        let notice = `Something went wrong. Please try again. If the error persist, refresh your page.`;
        return document.getElementById("noticeBoard").innerHTML = notice;
    } else {
        let notice = `Update fields populated with selected task's data. Make your changes and remember to <strong>update Date Field properly</strong>, then click <strong>Update Task</strong> button.`;
        document.getElementById("taskTitle").value = task.title;
        document.getElementById("taskTitle").setAttribute("autofocus", true);
        document.getElementById("detail").value = task.detail;
        document.getElementById("status").value = task.status;
        document.getElementById("addTask").setAttribute("onclick", `updateTask('${taskId}')`);
        document.getElementById("addTask").innerHTML = "Update Task";
        document.getElementById("noticeBoard").innerHTML = notice;
        return window.location = "#noticeBoard"
    };
};

function updateTask(taskId) {
    event.preventDefault();
    tasks = retrieveSaved("tasks");
    let task = tasks[taskId];
    if (compareObject(task, {})) {
        return document.getElementById("noticeBoard").innerHTML = notice;
    } else {
        let stats = retrieveSaved("task-stat");
        let title = document.getElementById("taskTitle").value;
        task.detail = document.getElementById("detail").value;
        task.date = new Date(document.getElementById("dateTime").value).toLocaleString();
        let status = document.getElementById("status").value;
        if (task.status.toLowerCase() == "done") {
            if (status.toLowerCase() != "done") {
                stats.completed -= 1;
                stats.uncompleted += 1;
            };
        } else if (task.status.toLowerCase() != "done") {
            if (status.toLowerCase() == "done") {
                stats.completed += 1;
                stats.uncompleted -= 1;
            };
        };
        
        task.title = title;
        task.status = status;
        tasks[taskId] = task;
        let notice = `Task: ${title} updated successfully.`;
        saveItem("tasks", tasks);
        saveItem("task-stat", stats);
        updateDataTables();
        document.getElementById("noticeBoard").innerHTML = notice;
    };
};

function clearSavedTasks() {
    localStorage.clear();
    updateDataTables();
    document.getElementById("noticeBoard").innerHTML = "All saved items and stats have been deleted.";
    return window.location = "#noticeBoard";
};

function submitTask() {
    event.preventDefault();
    let title = document.getElementById("taskTitle").value;
    let detail = document.getElementById("detail").value;
    let date = new Date(document.getElementById("dateTime").value);
    let status = document.getElementById("status").value;
    date = date.toLocaleString();
    tasks = retrieveSaved("tasks");
    if (isSaved(title, tasks)) {
        let notice = `Task already saved and duplicate not allowed. Please save a different task or modify previous one. <br>Title: ${title}`;
        return document.getElementById("noticeBoard").innerHTML = notice;
    } else {
        let notice = `Task: ${title} saved successfully.`;
        let stats = retrieveSaved("task-stat");
        tasks[`Task-${Math.random().toString().slice(2,6)}`] = {
            "title": title,
            "detail": detail,
            "date": date,
            "status": status
        };
        if (compareObject(stats, {})) {
            if (status.toLowerCase() == "done") {
                stats = {
                    "all": 1,
                    "completed": 1,
                    "uncompleted": 0,
                    "deleted": 0
                };
            } else {
                stats = {
                    "all": 1,
                    "completed": 0,
                    "uncompleted": 1,
                    "deleted": 0
                };
            };
        } else {
            if (status.toLowerCase() == "done") {
                stats.all += 1;
                stats.completed += 1;
            } else {
                stats.all += 1;
                stats.uncompleted += 1;
            };
        };
        saveItem("tasks", tasks);
        saveItem("task-stat", stats);
        updateDataTables();
        document.getElementById("noticeBoard").innerHTML = notice;
    };
}

function isSaved(item, tasks) {
    item = item.toLowerCase();
    for (let i in tasks) {
        if (item == tasks[i].title.toLowerCase()) {
            return true;
        };
    };
    return false;
};

function updateTaskList() {
    let allTask = "";
    tasks = retrieveSaved("tasks");
    if (compareObject(tasks, {})) {
        let noTask = '<tr><td colspan="4" class="text-center">No saved task. Use form above to add task(s).</td></tr>';
        return document.getElementById("allTask").innerHTML = noTask;
    } else {
        for (let i in tasks) {
            allTask += `<tr><td>${tasks[i].title}</td><td>${tasks[i].detail}</td><td>${tasks[i].date}</td>
            <td>
                ${tasks[i].status}
                <div>
                    <button type="submit" class='btnBtn' onclick="removeTask('${i}')">Delete</button>
                    <button type="submit" class='btnBtn' onclick="populateUpdateFields('${i}')">Update</button>
                </div>
            </td></tr>`;
        };
        return document.getElementById("allTask").innerHTML = allTask;
    };
};

function updateTaskStat() {
    let taskStat = retrieveSaved("task-stat");
    if (compareObject(taskStat, {})) {
        let noStat = '<tr><td colspan="4" class="text-center">Stats unavailable at the moment. Add tasks to see task(s) statistics.</td></tr>';
        return document.getElementById("taskStat").innerHTML = noStat;
    } else {
        let stat = `<td>${taskStat.all}</td><td>${taskStat.completed}</td><td>${taskStat.uncompleted}</td><td>${taskStat.deleted}</td>`;
        return document.getElementById("taskStat").innerHTML = stat;
    };
};

function compareObject(obj1, obj2) {
    // Modified copy of implementaion from: 
    // http://dmitripavlutin.com/how-to-compare-objects-in-javascript/
    // Add try/catch statements.
    try {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) {
            return false;
        };
        for (let key of keys1) {
            if (obj1[key] !== obj2[key]) {
                return false;
            };
        }
    } catch(error) {
        return false;
    };
    return true;
};

function resetFormFields() {
    document.getElementById("taskTitle").value = "";
    document.getElementById("detail").value = "";
    document.getElementById("status").value = "";
    document.getElementById("dateTime").value = "";
    document.getElementById("addTask").setAttribute("onclick", "submitTask()");
    document.getElementById("addTask").innerHTML = "Save Task";
    return true;
};

function updateDataTables() {
    updateTaskList();
    updateTaskStat();
    resetFormFields();
};

updateDataTables();
