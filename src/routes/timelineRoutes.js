const router = require('express').Router()
const timelineController = require('../controller/timelineController')
const { authentication } = require('../middleware/auth')

router.get('/admin', timelineController.getAllTimeline)

router.get('/detail/:id', timelineController.getTimelineDetail)

router.get('/current/id', timelineController.getCurrentTimeline)

router.get('/project/:id', authentication, timelineController.getAllProjectTimeline)

router.post('/add', authentication, timelineController.createNewTimeline)

router.patch('/update/:id', authentication, timelineController.updateProjectTimeline)

router.delete('/delete/:id', authentication, timelineController.deleteProjectTimeline)

module.exports = router