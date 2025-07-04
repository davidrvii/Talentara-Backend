const router = require('express').Router()
const userController = require('../controller/userController')
const { authentication, authorization } = require('../middleware/auth')
const multer = require('multer');
const upload = multer();

router.get('/admin', userController.getAllUser)

router.get('/detail/:id', authentication, userController.getUserDetail)

router.get('/basic/:id', authentication, userController.getUserBasic)

router.post('/register', userController.userRegister)

router.post('/login', userController.userLogin)

router.patch('/update/:id', authentication, authorization, upload.single('user_image'), userController.updateUser)

router.patch('/fcm', authentication, authorization, userController.saveFcmToken)

router.delete('/delete/:id', authentication, authorization, userController.deleteUser)

module.exports = router

