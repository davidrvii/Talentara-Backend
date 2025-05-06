const router = require('express').Router()
const userController = require('../controller/userController')
const { authentication } = require('../middleware/auth')

router.get('/admin', userController.getAllUser)

router.get('/detail/:id', userController.getUserDetail)

router.post('/register', userController.userRegister)

router.post('/login', userController.userLogin)

router.patch('/update/:id', authentication, userController.updateUser)

router.delete('/delete/:id', authentication, userController.deleteUser)

module.exports = router

