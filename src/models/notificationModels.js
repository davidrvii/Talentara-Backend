const dbPool = require('../config/database')

//Get All Notification From Database (Testing-Only)
const getAllNotification = () => {
    const sqlQuery = `SELECT * FROM notification`

    return dbPool.execute(sqlQuery)
}

//Get All Notification By Specific User
const getHistoryNotification = (user_id) => {
    const sqlQuery =   `SELECT * FROM notification
                        WHERE user_id = ?`

    return dbPool.execute(sqlQuery, [user_id])
}

//Get a Notification Detail By ID For Push Notification
const getNotificationDetail = (notification_id) => {
    const sqlQuery =   `SELECT * FROM notification
                        WHERE notification_id = ?`

    return dbPool.execute(sqlQuery, [notification_id])
}

//Create a New Notification
const createNewNotification = (body, user_id) => {
    const sqlQuery =   `INSERT INTO notification (user_id, notification_title, notification_desc)
                        VALUES (?, ?, ?)`

    return dbPool.execute(sqlQuery, [user_id, body.notification_title, body.notification_desc])
}

//Update a Notification By ID (Testing-Only)
const updateNotification = (body, notification_id) => {
    const keys = Object.keys(body);
    const values = Object.values(body);

    //Custom Query Following By User Input
    const fields = keys.map(key => `${key} = ?`).join(', ')
    const sqlQuery = `UPDATE notification SET ${fields} WHERE notification_id = ?`

    return dbPool.execute(sqlQuery, [...values, notification_id])
}

//Delete a Notification By ID (Testing-Only)
const deleteNotification = (notification_id) => {
    const sqlQuery = `DELETE FROM notification WHERE notification_id = ?`

    return dbPool.execute(sqlQuery, [notification_id])
}

module.exports = {
    getAllNotification,
    getHistoryNotification,
    getNotificationDetail,
    createNewNotification,
    updateNotification,
    deleteNotification
}