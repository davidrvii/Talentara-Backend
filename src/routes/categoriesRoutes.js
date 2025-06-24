const router = require('express').Router()
const categoriesController = require('../controller/categoriesController')
const { authentication } = require('../middleware/auth')

router.get('/all',  authentication, categoriesController.getAllCategories)

router.get('/feature',  authentication, categoriesController.getAllFeature)

router.get('/platform',  authentication, categoriesController.getAllPlatform)

router.get('/productType',  authentication, categoriesController.getAllProductType)

router.get('/role',  authentication, categoriesController.getAllRole)

router.get('/language',  authentication, categoriesController.getAllLanguage)

router.get('/tools',  authentication, categoriesController.getAllTools)

module.exports = router