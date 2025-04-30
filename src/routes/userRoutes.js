const router = require('express').Router()
const userController = require('../controller/userController')
const { authentication } = require('../middleware/auth')

router.get('/', userController.getAllUser)

router.get('/:id', userController.getUserDetail)

router.post('/register', userController.userRegister)

router.post('/login', userController.userLogin)

router.patch('/:id', authentication, userController.updateUser)

router.delete('/:id', authentication, userController.deleteUser)


module.exports = router

