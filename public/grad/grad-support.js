function changeBackgroundImage(imageHREF, elementID, doc) {
    doc.getElementById(elementID).style.backgroundImage = "url(" + imageHREF + ")"
}

function changeProfImage(imageHREF, elementID, doc) {
    doc.getElementById(elementID).style.backgroundImage = "url(" + imageHREF + ") 50% 50% no-repeat;"
}

function getJsonFromUrl(url) {
    if(!url) url = location.search;
    let query = url.substr(1);
    let result = {};
    query.split("&").forEach(function(part) {
        let item = part.split("=");
        result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
}


let fileUploading = false
let fileURL = ""

async function uploadProfile(doc, file, uid) {
    doc.getElementById("imageStatus").innerText = "Uploading..."

    let storageRef = storage.ref();
    let folderRef = storageRef.child(uid);

    fileUploading = true

    let fileType = file.name.split('.').pop();
    if (fileType.toLowerCase() === "jpg" || fileType.toLowerCase() === "jpeg" || fileType.toLowerCase() === "png" || fileType.toLowerCase() === "bmp") {
        let imageUID = makeImageUID(6);
        let saveName = uid + imageUID + "." + fileType;
        let ref = folderRef.child(saveName);
        await ref.put(file).then(async function (snapshot) {
            console.log('Uploaded a file!');
            doc.getElementById("imageStatus").innerText = "Uploaded"
            fileURL = await ref.getDownloadURL()
            doc.getElementById("imageStatus").href = fileURL
            fileUploading = false
        });
    } else {
        console.log(file.name + " is not of a supported image type!");
    }
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

function checkFields(doc) {
    let inputNodes = doc.querySelectorAll("input, textarea")
    for (let i=0; i<inputNodes.length; i++) {
        let node = inputNodes[i]
        console.log(node.value)
        if ((node.value === "" || node.value === undefined) && node.id[0] !== "O") {
            return false
        }
    }
    return true
}

async function dump(domDoc, collection, document, defaultValues, window, location) {
    let obj = {}
    if (defaultValues !== undefined) {
        obj = defaultValues
    }
    let inputNodes = domDoc.querySelectorAll("input, textarea")
    for (let i=0; i<inputNodes.length; i++) {
        let node = inputNodes[i]
        console.log("DUMP")
        console.log(node.id)
        if (node.id[0] !== "X" && node.id[0] !== "C") {
            obj[node.id] = node.value
        } else if (node.id[0] === "C") {
            obj[node.id] = node.checked
        }
    }
    await db.collection(collection).doc(document).set(obj).then(function () {
        console.log("Document Written!")
        window.location = location
        return true
    })
}

function generateUID(length) {
    let result           = '';
    let characters       = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function createCell(name, description, imageSrc, uid, doc, elem) {
    let cell = document.createElement("div")
    cell.id = "D-" + uid
    cell.className = "cell"
    cell.onclick = function () {
        window.location = "profile.html?uid=" + uid.toString()
    }

    let imageDiv = doc.createElement("div")
    imageDiv.id = "L-" + generateUID(6)
    imageDiv.className = "cellImageDiv"

    let image = doc.createElement("img")
    image.className = "cellImage"
    image.alt = name + "'s Profile Picture"
    image.src = imageSrc

    imageDiv.appendChild(image)

    cell.appendChild(imageDiv)

    let infoDiv = doc.createElement("div")
    infoDiv.id = "R-" + generateUID(6)
    infoDiv.className = "cellInfoDiv"
    infoDiv.style.paddingRight = "10px"

    let nameNode = doc.createElement("h2")
    nameNode.id = "T-" + generateUID(6)
    nameNode.className = "cellName"
    nameNode.innerText = name

    infoDiv.appendChild(nameNode)

    let detailNode = doc.createElement("p")
    detailNode.id = "B-" + generateUID(6)
    detailNode.className = "cellDescription"
    detailNode.innerText = description

    infoDiv.appendChild(detailNode)

    cell.appendChild(infoDiv)

    elem.appendChild(cell)

    adjustUI()
}
