const router = require('express').Router()
const portfolioController = require('../controller/portfolioController')
const { authentication, authorization } = require('../middleware/auth')

router.get('/admin', portfolioController.getAllPortfolio)

router.get('/talent/:id', authentication, portfolioController.getAllTalentPortfolio)

router.get('/detail/:id', authentication, portfolioController.getPortfolioDetail)

router.post('/add', authentication, authorization, portfolioController.createNewPortfolio)

router.patch('/update/:id', authentication, authorization, portfolioController.updatePortfolio)

router.delete('/delete/:id', authentication, authorization, portfolioController.deletePortfolio)

module.exports = router