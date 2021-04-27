function generateUID(length) {
    let result           = '';
    let characters       = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
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

function changeBackgroundImage(imageHREF, elementID, doc) {
    doc.getElementById(elementID).style.backgroundImage = "url(" + imageHREF + ")"
}