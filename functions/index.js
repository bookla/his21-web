const functions = require("firebase-functions");
const express = require('express');
const admin = require('firebase-admin');
const app = express();

admin.initializeApp({credential: admin.credential.applicationDefault()});

const db = admin.firestore();

exports.app = functions.https.onRequest(app);
exports.profile = functions.https.onRequest(app);
exports.graduates = functions.https.onRequest(app);

app.get("/graduates/**", async (req, res) => {
    let page = req.path.slice(1).replace("graduates/", "");
    if (page === "") {
       page = 0
    }
    if (isNaN(parseInt(page))) {
        res.writeHead(307, {Location: "https://his21.plailert.dev/graduates/"});
        res.end()
        return
    } else {
        page = parseInt(page)
    }

    let data = await db.collection("gradData").get()
    let pageTotal = Math.floor((data.size - 1)/10)

    if (page < 0 || page > pageTotal) {
        res.writeHead(307, {Location: "https://his21.plailert.dev/graduates/"});
        res.end()
        return
    }

    res.send(`
    <!doctype html>
    <head>
        <title>Harrow Bangkok Graduate Profiles</title>
      
        <link rel="apple-touch-icon" sizes="57x57" href="media/icon.ico/apple-icon-57x57.png">
        <link rel="apple-touch-icon" sizes="60x60" href="media/icon.ico/apple-icon-60x60.png">
        <link rel="apple-touch-icon" sizes="72x72" href="media/icon.ico/apple-icon-72x72.png">
        <link rel="apple-touch-icon" sizes="76x76" href="media/icon.ico/apple-icon-76x76.png">
        <link rel="apple-touch-icon" sizes="114x114" href="media/icon.ico/apple-icon-114x114.png">
        <link rel="apple-touch-icon" sizes="120x120" href="media/icon.ico/apple-icon-120x120.png">
        <link rel="apple-touch-icon" sizes="144x144" href="media/icon.ico/apple-icon-144x144.png">
        <link rel="apple-touch-icon" sizes="152x152" href="media/icon.ico/apple-icon-152x152.png">
        <link rel="apple-touch-icon" sizes="180x180" href="media/icon.ico/apple-icon-180x180.png">
        <link rel="icon" type="image/png" sizes="192x192"  href="media/icon.ico/android-icon-192x192.png">
        <link rel="icon" type="image/png" sizes="32x32" href="media/icon.ico/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="96x96" href="media/icon.ico/favicon-96x96.png">
        <link rel="icon" type="image/png" sizes="16x16" href="media/icon.ico/favicon-16x16.png">
        <meta name="og:image" property="og:image" content="https://his21.plailert.dev/grad/media/logo.JPG" data-react-helmet="true">
        <meta name="twitter:image" content="https://his21.plailert.dev/grad/media/logo.JPG" data-react-helmet="true">
        <meta data-react-helmet="true" name="og:description" property="og:description" content="Harrow Bangkok Class of 2021 Graduates. Page ${page + 1}/${pageTotal}.">
        <meta data-react-helmet="true" name="description" content="Harrow Bangkok Class of 2021 Graduates. Page ${page + 1}/${pageTotal}.">
        <meta data-react-helmet="true" name="twitter:description" content="Harrow Bangkok Class of 2021 Graduates. Page ${page + 1}/${pageTotal}.">
        <meta data-react-helmet="true" name="og:title" property="og:title" content="Harrow Bangkok Graduate Profiles">
        <meta data-react-helmet="true" name="title" content="Harrow Bangkok Graduate Profiles">
        <meta data-react-helmet="true" name="twitter:title" content="Harrow Bangkok Graduate Profiles">
          
        
    </head>
    <body>
        <iframe src="https://his21.plailert.dev/grad/index.html?page=${page}" style="position: fixed; top: 0; bottom: 0; right: 0; width: 100%; border: none; margin: 0; padding: 0; overflow: hidden; z-index: 999999; height: 100%;"></iframe>
    </body>
  </html>`);
})


app.get("/profile/**", async (req, res) => {
    let userID = req.path.slice(1).replace("profile/", "");

    console.log(userID);
    if (userID === undefined || userID === "profile") {
        res.writeHead(307, {Location: "https://his21.plailert.dev/grad/"});
        res.end();
        return;
    }

    let page = 0;
    if (userID.includes("&page=")) {
        let pageTemp = userID.split("&page=")[1]
        page = parseInt(pageTemp)
        userID = userID.split("&page=")[0]
    }

    let userDocument = await db.collection("gradData").doc(userID).get();
    if (!userDocument.exists) {
        res.writeHead(307, {Location: "https://his21.plailert.dev/grad/" + userID});
        res.end();
        return;
    }

    let data = userDocument.data();
    let name = data["name"];
    let image = data["img"];
    let description = data["description"];

    console.log(name);
    console.log(description);


    res.send(`
    <!doctype html>
    <head>
        <title>${name}</title>
      
        <link rel="apple-touch-icon" sizes="57x57" href="media/icon.ico/apple-icon-57x57.png">
        <link rel="apple-touch-icon" sizes="60x60" href="media/icon.ico/apple-icon-60x60.png">
        <link rel="apple-touch-icon" sizes="72x72" href="media/icon.ico/apple-icon-72x72.png">
        <link rel="apple-touch-icon" sizes="76x76" href="media/icon.ico/apple-icon-76x76.png">
        <link rel="apple-touch-icon" sizes="114x114" href="media/icon.ico/apple-icon-114x114.png">
        <link rel="apple-touch-icon" sizes="120x120" href="media/icon.ico/apple-icon-120x120.png">
        <link rel="apple-touch-icon" sizes="144x144" href="media/icon.ico/apple-icon-144x144.png">
        <link rel="apple-touch-icon" sizes="152x152" href="media/icon.ico/apple-icon-152x152.png">
        <link rel="apple-touch-icon" sizes="180x180" href="media/icon.ico/apple-icon-180x180.png">
        <link rel="icon" type="image/png" sizes="192x192"  href="media/icon.ico/android-icon-192x192.png">
        <link rel="icon" type="image/png" sizes="32x32" href="media/icon.ico/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="96x96" href="media/icon.ico/favicon-96x96.png">
        <link rel="icon" type="image/png" sizes="16x16" href="media/icon.ico/favicon-16x16.png">
        <meta name="og:image" property="og:image" content="${image}" data-react-helmet="true">
        <meta name="twitter:image" content="${image}" data-react-helmet="true">
        <meta data-react-helmet="true" name="og:description" property="og:description" content="View ${name}'s Harrow Bangkok Class of 2021 Profile">
        <meta data-react-helmet="true" name="description" content="View ${name}'s Harrow Bangkok Class of 2021 Profile">
        <meta data-react-helmet="true" name="twitter:description" content="View ${name}'s Harrow Bangkok Class of 2021 Profile">
        <meta data-react-helmet="true" name="og:title" property="og:title" content="${name}">
        <meta data-react-helmet="true" name="title" content="${name}">
        <meta data-react-helmet="true" name="twitter:title" content="${name}">
        
    </head>
    <body>
        <iframe src="https://his21.plailert.dev/grad/profile.html?uid=${userID}&page=${page}" style="position: fixed; top: 0; bottom: 0; right: 0; width: 100%; border: none; margin: 0; padding: 0; overflow: hidden; z-index: 999999; height: 100%;"></iframe>
    </body>
  </html>`);
});

