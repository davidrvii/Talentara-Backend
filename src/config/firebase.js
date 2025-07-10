const admin = require("firebase-admin")
const serviceAccount = require("./talentara-project-firebase-adminsdk-fbsvc-75f3fb2956.json")

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
})

module.exports = admin
