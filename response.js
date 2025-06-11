const response = (statusCode, data, message, res) =>{
    res.status(statusCode).json(
        {
            success: statusCode >= 200 && statusCode < 300,
            statusCode: statusCode,
            message: message,
            timestamp: new Date().toISOString(),
            ...data,
        }
    )
}

module.exports = response