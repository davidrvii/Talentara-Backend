const admin = require("firebase-admin")

const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
if (!base64) throw new Error("FCM ENV not set")

const jsonString = Buffer.from(base64, "base64").toString("utf8")
const serviceAccount = JSON.parse(jsonString)

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
})

module.exports = admin
