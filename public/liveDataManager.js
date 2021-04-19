var liveSaveOn = false;
var pauseUpdate = false;
var pauseTimer = undefined;

async function checkName() {
    console.log("Name Changed");
    await setTimeout(async function() {
        let name = document.getElementById("nameField").value;
        let lowerCasedNames = listOfNames.map(v => v.toLowerCase());
        let capitalised_name = listOfNames[lowerCasedNames.indexOf(name.toLowerCase())];
        if (lowerCasedNames.includes(name.toLowerCase()) && !liveSaveOn) {
            liveSaveOn = true;
            document.getElementById("nameField").setAttribute("disabled", true);
            setTimeout(function() {
                document.getElementById("nameField").setAttribute("disabled", false);
            }, 3000);
            await loadLiveData();
            document.getElementById("nameLocked").innerText = "\"" + capitalised_name + "\"";
            document.getElementById("nameField").value = capitalised_name;
            document.getElementById("nameLocked").style.display = "block";
            document.getElementById("nameField").setAttribute("hidden", "hidden");
            document.getElementById("saveStatus").innerText = "Changes Saved (You still need to submit the form)";
            db.collection("working").doc(uid).onSnapshot(function(doc) {
                if (!pauseUpdate) {
                    restoredAlerted = true;
                    restoringAlerted = true;
                    loadLiveData()
                }
            });

        } else {
            document.getElementById("saveStatus").innerText = "Changes not saved (Name does not exist)";
            liveSaveOn = false;
        }
    }, 500);
}

let restoringAlerted = false;
let restoredAlerted = false;

async function loadLiveData() {
    if (liveSaveOn) {
        if (!restoringAlerted) {
            restoringAlerted = true;
            setTimeout(function() {
                restoringAlerted = false
            }, 2000)
        }
        await checkUploadedImage()
        if (await liveDataExists(uid)) {
            db.collection("working").doc(uid).get().then(function(doc) {
                if (doc.exists) {
                    let data = doc.data();
                    for (let key in data) {
                        if (data.hasOwnProperty(key)) {
                            if (key !== "selection" && key !== "imageLinks" && key !== "date" && key !== "name") {
                                document.getElementById(key).value = doc.data()[key]
                            } else {
                                let selectionData = doc.data()["selection"];
                                for (var selectKey in selectionData) {
                                    if (selectionData.hasOwnProperty(selectKey)) {
                                        if (selectionData[selectKey] === "e") {
                                            document.getElementById(selectKey).selectedIndex = 0
                                        } else if (selectKey !== "houseSelector") {
                                            if (document.getElementById(selectKey).options[1].value === "everyone") {
                                                if (selectionData[selectKey] === "everyone") {
                                                    document.getElementById(selectKey).selectedIndex = 1
                                                } else {
                                                    document.getElementById(selectKey).selectedIndex = listOfNames.indexOf(selectionData[selectKey]) + 2
                                                }
                                            } else {
                                                document.getElementById(selectKey).selectedIndex = listOfNames.indexOf(selectionData[selectKey]) + 1
                                            }
                                        } else {
                                            document.getElementById(selectKey).selectedIndex = ["B", "So", "C", "N", "K", "S"].indexOf(selectionData[selectKey]) + 1
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (!restoredAlerted) {
                        restoredAlerted = true;
                        setTimeout(function() {
                            restoredAlerted = false
                        }, 2000)
                    }
                }
            })
        }
    }
}

function changeStatus() {
    document.getElementById("saveStatus").innerText = "Saving Changes...";
}

var timer = undefined;
let fieldsToSave = [];

async function fieldEdited(fieldID) {
    console.log("Field Edit Detected");
    if (!fieldsToSave.includes(fieldID)) {
        fieldsToSave.push(fieldID);
    }
    if (timer !== undefined) {
        clearTimeout(timer)
    } else {
        document.getElementById("saveStatus").innerText = "Not Saved(Currently Editing)";
    }
    timer = setTimeout(function() {
        console.log(fieldsToSave);
        let length = fieldsToSave.length;
        for (var i=0; i<length; i++) {
            document.getElementById("saveStatus").innerText = "Loading changes...";
            console.log(fieldsToSave.length - 1);
            console.log(fieldsToSave[fieldsToSave.length - 1]);
            saveLiveData(fieldsToSave[fieldsToSave.length - 1]);
            fieldsToSave.pop()
        }
    }, 3000);
}

async function saveLiveData(fieldID) {
    if (pauseTimer !== undefined) {
        clearTimeout(pauseTimer)
    }
    pauseUpdate = false;
    pauseTimer = setTimeout(function() {
        pauseUpdate = false
    }, 1000);
    console.log("Saving Live Data");
    document.getElementById("saveStatus").innerText = "Saving changes...";
    let name = document.getElementById("nameField").value;
    let updateData =  {};
    updateData[fieldID] = document.getElementById(fieldID).value;
    updateData["name"] = name

    updateData["date"] = new Date()

    if (await liveDataExists(uid)) {
        db.collection("working").doc(uid).update(updateData).then(function() {
            console.log("Document successfully written!");
            document.getElementById("saveStatus").innerText = "Changes Saved (You still need to submit the form)";
        }).catch(function(error) {
            console.error("Error writing document: ", error);
        });
    } else {
        db.collection("working").doc(uid).set(updateData).then(function () {
            console.log("Document successfully written!");
            document.getElementById("saveStatus").innerText = "Changes Saved (You still need to submit the form)";
        }).catch(function (error) {
            console.error("Error writing document: ", error);
        });
    }
}

function saveSelectionData(fieldID) {
    if (pauseTimer !== undefined) {
        clearTimeout(pauseTimer)
    }
    pauseUpdate = false;
    pauseTimer = setTimeout(function() {
        pauseUpdate = false
    }, 1000);
    console.log("Selection Change");
    console.log(fieldID);
    db.collection("working").doc(uid).get().then(async function(doc) {
        if (await liveDataExists(uid)) {
            let updateData = doc.data();
            if (!("selection" in updateData)) {
                updateData["selection"] = {}
            }
            updateData["selection"][fieldID] = getValue(fieldID);
            updateData["date"] = new Date()
            console.log(updateData);
            db.collection("working").doc(uid).update(updateData).then(function () {
                console.log("Document successfully written!");
            }).catch(function (error) {
                console.error("Error writing document: ", error);
            });
        } else {
            db.collection("working").doc(uid).set(updateData).then(function () {
                console.log("Document successfully written!");
            }).catch(function (error) {
                console.error("Error writing document: ", error);
            });
        }
    })
}

async function liveDataExists(userName) {
    let value = false
    await db.collection('working').doc(userName).get().then((docSnapshot) => {
        if (docSnapshot.exists) {
            value = true
        }
    });
    return value
}