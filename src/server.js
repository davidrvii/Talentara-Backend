require("dotenv").config('../env')

const app = require("./app")

// Global Unhandled Rejection & Exception Handler → avoid SIGTERM
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason)
})

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err)
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`This app listening on post ${PORT}`)
})