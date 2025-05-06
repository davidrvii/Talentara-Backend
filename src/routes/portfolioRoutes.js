const router = require('express').Router()
const portfolioController = require('../controller/portfolioController')
const { authentication } = require('../middleware/auth')

router.get('/admin', portfolioController.getAllPortfolio)

router.get('/talent/:id', authentication, portfolioController.getAllTalentPortfolio)

router.get('/detail/:id', portfolioController.getPortfolioDetail)

router.post('/add', authentication, portfolioController.createNewPortfolio)

router.patch('/update/:id', authentication, portfolioController.updatePortfolio)

router.delete('/delete/:id', authentication, portfolioController.deletePortfolio)

module.exports = router