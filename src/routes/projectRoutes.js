const router = require('express').Router()
const projectController = require('../controller/projectController')
const { authentication } = require('../middleware/auth')

router.get('/admin', projectController.getAllProject)

router.get('/history/:id', authentication, projectController.getAllProjectHistory)

router.get('/leader/:id', authentication, projectController.getLeaderProject)

router.get('/team/:id', authentication, projectController.getTeamProject)

router.get('/detail/:id', authentication, projectController.getProjectDetail)

router.post('/add', authentication, projectController.createNewProject)

router.patch('/update/:id', authentication, projectController.updateProject)

router.delete('/delete/:id', authentication, projectController.deleteProject)

module.exports = router