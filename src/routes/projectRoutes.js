const router = require('express').Router()
const projectController = require('../controller/projectController')
const { authentication, authorization } = require('../middleware/auth')

router.get('/admin', projectController.getAllProject)

router.get('/history/:id', authentication, projectController.getAllProjectHistory)

router.get('/order/:id', authentication, projectController.getProjectOrder)

router.get('/detail/:id', authentication, projectController.getProjectDetail)

router.get('/current/:id', authentication, authorization, projectController.getCurrentProject)

router.post('/add', authentication, authorization, projectController.createNewProject)

router.patch('/update/:id', authentication, authorization, projectController.updateProject)

router.patch('/offer', authentication, authorization, projectController.respondToProjectOffer)

router.delete('/delete/:id', authentication, authorization, projectController.deleteProject)

module.exports = router