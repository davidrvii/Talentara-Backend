const router = require('express').Router()
const timelineController = require('../controller/timelineController')
const { authentication, authorization } = require('../middleware/auth')

router.get('/admin', timelineController.getAllTimeline)

router.get('/detail/:id', authentication, timelineController.getTimelineDetail)

router.get('/current/:id', authentication, timelineController.getCurrentTimeline)

router.get('/project/:id', authentication, timelineController.getAllTimelineProject)

router.get('approve/:id', authentication, authorization, timelineController.getTimelineApprovement)

router.post('/add', authentication, authorization, timelineController.createNewTimeline)

router.patch('/update/:id', authentication, authorization, timelineController.updateTimeline)

router.delete('/delete/:id', authentication, authorization, timelineController.deleteTimeline)

module.exports = router