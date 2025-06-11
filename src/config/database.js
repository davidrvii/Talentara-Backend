const mysql = require('mysql2')

const dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0
})

// Startup Logs
dbPool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.message)
    } else {
        console.log('Database connected successfully.')
        connection.release()
    }
})

module.exports = dbPool.promise()