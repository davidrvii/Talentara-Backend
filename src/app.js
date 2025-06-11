const express = require('express')
const app = express()
const router = require('./routes/router')
const middlewareLogRequest = require('./middleware/logs')

app.use(express.json())
app.use(express.urlencoded({ extended: true })) 
app.use(middlewareLogRequest)

app.use(router)

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err.stack)

    res.status(err.statusCode || 500).json({
        success: false,
        statusCode: err.statusCode || 500,
        message: err.message || 'Internal Server Error',
        timestamp: new Date().toISOString()
    })
})

module.exports = app