const router = require('express').Router()
const notificationController = require('../controller/notificationController')
const { authentication, authorization } = require('../middleware/auth')

router.get('/admin', notificationController.getAllNotification)

router.get('/history/:id', authentication, notificationController.getHistoryNotification)

router.get('/detail/:id', authentication, notificationController.getNotificationDetail)

router.post('/add', authentication, authorization, notificationController.createNewNotification)

router.patch('/update/:id', authentication, authorization, notificationController.updateNotification)

router.delete('/delete/:id', authentication, authorization, notificationController.deleteNotification)

module.exports = router