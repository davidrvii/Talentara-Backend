const notificationModel = require('../models/notificationModels')
const response = require('../../response')

const getAllNotification = async (req, res) => {
    try {
        const [notifications] = await notificationModel.getAllNotification()
        response(200, {notifications: notifications}, 'Get All Notification', res)
    } catch (error) {
        response(500, {error: error}, 'Get All Notification: Server Error', res)
        throw error
    }
}

const getHistoryNotification = async (req, res) => {
    const { id } = req.params

    try {
        const [notification] = await notificationModel.getHistoryNotification(id)
        if (notification.length === 0) {
            return response(404, {notificationDetail: null}, 'Get History Notification: Timeline Not Found', res)
        } else {
            response(200, {notificationDetail: notification}, 'Get History Notification Success', res)
        }
    } catch (error) {
        response(500, {error: error}, 'Get History Notification: Server Error', res)
        throw error
    }
}

const getNotificationDetail = async (req, res) => {
    const { id } = req.params

    try {
        const [notification] = await notificationModel.getNotificationDetail(id)
        if (notification.length === 0) {
            return response(404, {notificationDetail: null}, 'Get Notification Detail: Notification Not Found', res)
        } else {
            response(200, {notificationDetail: notification}, 'Get Notification Detail Success', res)
        }
    } catch (error) {
        response(500, {error: error}, 'Get Notification Detail: Server Error', res)
        throw error
    }
}

const createNewNotification = async (req, res) => {
    const { body } = req
    
    try {
        await notificationModel.createNewNotification(body)
        response(201, {newNotification: body}, 'Create New Notification Success', res)
    } catch (error) {
        response(500 , {error: error}, 'Create New Notification: Server Error', res)
        throw error
    }
}

const updateNotification = async (req, res) => {
    const { id } = req.params
    const { body } = req

    try {
        await notificationModel.updateNotification(body, id)
        response(200, {updatedNotification: body}, 'Update Notification Success', res)
    } catch (error) {
        response(500, {error: error}, 'Update Notification: Server Error', res)
        throw error
    }
}

const deleteNotification = async (req, res) => {
    const { id } = req.params

    try {
        await notificationModel.deleteNotification(id)
        response(200, {deletedNotificationId: id}, 'Delete Notification Success', res)
    } catch (error) {
        response(500, {error: error}, 'Delete Notification: Server Error', res)
        throw error
    }
}

module.exports = {
    getAllNotification,
    getHistoryNotification,
    getNotificationDetail,
    createNewNotification,
    updateNotification,
    deleteNotification
}