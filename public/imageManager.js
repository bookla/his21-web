let currentImages = [];


async function numberOfImages() {
    let number = 0
    await db.collection('working').doc(uid).get().then((docSnapshot) => {
        if (docSnapshot.exists) {
            number = docSnapshot.data()["imageLinks"].length
        }
    });
    return number
}


async function checkUploadedImage() {
    let imageTable = document.getElementById("imageTable")
    while  (imageTable !== undefined && imageTable !== null) {
        imageTable.parentElement.removeChild(imageTable)
        imageTable = document.getElementById("imageTable")
    }
    if (await liveDataExists(uid)) {
        console.log("Loading Image Data")
        db.collection("working").doc(uid).get().then(function(doc) {
            if (doc.exists) {
                let data = doc.data();
                if (data.hasOwnProperty("imageLinks")) {
                    currentImages = data["imageLinks"]
                    let table = document.createElement("table")
                    table.id = "imageTable"
                    table.class = "fl-table"
                    table.appendChild(titleRow())
                    let body = document.createElement("tbody")
                    console.log(currentImages)
                    for (let i = 0; i < currentImages.length; i++) {
                        let image = currentImages[i]
                        let row = createCompleteRow(image, i + 1)
                        body.appendChild(row)
                    }
                    table.appendChild(body)
                    document.getElementById("imageTableDiv").appendChild(table)
                }
            }
        })
    }
}


function createCompleteRow(link, num) {
    let row = document.createElement("tr")
    row.id = link

    let status = document.createElement("td")
    status.innerText = "Uploaded"
    row.appendChild(status)

    let linkRow = document.createElement("td")
    let imageLinkText = document.createElement("a")
    imageLinkText.href = "javascript:void()"
    imageLinkText.onclick = function() {
        window.open(link, '_blank')
    }
    imageLinkText.innerText = "#" + num.toString() + " Click to view image"
    linkRow.appendChild(imageLinkText)
    row.appendChild(linkRow)

    let removeRow = document.createElement("td")
    let removeButton = document.createElement("a")
    removeButton.href = "javascript:void()"
    removeButton.innerText = "Remove"
    removeButton.onclick = function() {
        console.log("Remove!")
        removeImage(link);
    }
    removeRow.appendChild(removeButton)

    row.appendChild(removeRow)

    return row
}


function removeImage(imageLink) {
    const index = currentImages.indexOf(imageLink);
    if (index > -1) {
        currentImages.splice(index, 1);
    }
    saveLinks()
}


function titleRow() {
    let head = document.createElement("thead")
    let row = document.createElement("tr")

    let d1 = document.createElement("th")
    d1.innerText = "Status"
    row.appendChild(d1)

    let d2 = document.createElement("th")
    d2.innerText = "Image Link"
    row.appendChild(d2)

    let d3 = document.createElement("th")
    d3.innerText = "Actions"
    row.appendChild(d3)

    head.appendChild(row)
    return head
}

function filesSelected(picker) {
    console.log(picker.files)
    Array.from(picker.files).forEach(function (item, index) {
        fileSelected(item, item.name)
    })
}

function fileSelected(file, fileName) {

    let table = document.getElementById("imageTable")

    if (table === undefined || table === null) {
        table = document.createElement("table")
        table.id = "imageTable"
        table.class = "fl-table"
        table.appendChild(titleRow())
        document.getElementById("imageTableDiv").appendChild(table)
    }

    let row = document.createElement("tr")
    row.id = fileName

    let status = document.createElement("td")
    status.innerText = "Uploading"
    row.appendChild(status)

    let linkRow = document.createElement("td")
    let imageLinkText = document.createElement("a")
    imageLinkText.href = "javascript:void()"
    imageLinkText.onclick = function() {
        alert("Image is still being uploaded!")
    }
    imageLinkText.innerText = fileName
    linkRow.appendChild(imageLinkText)
    row.appendChild(linkRow)

    let removeRow = document.createElement("td")
    row.appendChild(removeRow)

    let body = document.createElement("tbody")
    body.appendChild(row)

    table.appendChild(body)

    uploadToFirebaseStorage(file)
}


async function saveLinks() {
    let updateData = {imageLinks: currentImages}
    if (await liveDataExists(uid)) {
        db.collection("working").doc(uid).update(updateData).then(function() {
            console.log("Document successfully written!");
            checkUploadedImage();
        }).catch(function(error) {
            alert("Failed to upload photo. Try reloading the page and try again.")
            console.error(error)
        });
    }
}


function completeUpload(name, link) {

    currentImages.push(link)
    console.log(currentImages)

    saveLinks()
}



function makeImageUID(length) {
    let result           = '';
    let characters       = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


async function uploadToFirebaseStorage(file) {
    console.log("Uploading")
    console.log(currentImages)

    let storageRef = storage.ref();
    let folderRef = storageRef.child(uid);


    let fileType = file.name.split('.').pop();
    if (fileType.toLowerCase() === "jpg" || fileType.toLowerCase() === "jpeg" || fileType.toLowerCase() === "png" || fileType.toLowerCase() === "heic" || fileType.toLowerCase() === "heif") {
        let imageUID = makeImageUID(6);
        let prefix = nameField.value.split(" ")[0];
        let saveName = prefix + imageUID + "." + fileType;
        console.log(saveName);
        console.log(file);
        let ref = folderRef.child(saveName);
        await ref.put(file).then(async function (snapshot) {
            console.log('Uploaded a file!');
            completeUpload(file.name, await ref.getDownloadURL())
        });
    } else {
        console.log(file.name + " is not of a supported image type!");
    }
}


async function asyncCheck(current, target, urls, timer, nameExists) {
    if (current === target) {
        clearInterval(timer);
        console.log(urls);
        if (nameExists) {
            console.log("Not saving votes.");
            await saveData(urls, false);
        } else {
            console.log("Saving Votes");
            await saveData(urls, false);
            await saveVotes();
        }
    }
}