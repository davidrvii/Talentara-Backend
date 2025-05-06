const router = require('express').Router()
const notificationController = require('../controller/notificationController')
const { authentication } = require('../middleware/auth')

router.get('/admin', notificationController.getAllNotification)

router.get('/history/:id', authentication, notificationController.getHistoryNotification)

router.get('/detail/:id', notificationController.getNotificationDetail)

router.post('add', authentication, notificationController.createNewNotification)

router.patch('/update/:id', authentication, notificationController.updateNotification)

router.delete('/delete/:id', authentication, notificationController.deleteNotification)

module.exports = router