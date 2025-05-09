const router = require('express').Router()
const talentController = require('../controller/talentController')
const { authentication } = require('../middleware/auth')

router.get('/admin', talentController.getAllTalent)

router.get('/detail/:id', talentController.getTalentDetail)

router.post('/add', authentication, talentController.createNewTalent)

router.patch('/update/:id', authentication, talentController.updateTalent)

router.delete('/delete/:id', authentication, talentController.deleteTalent)

module.exports = router