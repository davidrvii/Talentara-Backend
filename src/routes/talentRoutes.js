const router = require('express').Router()
const talentController = require('../controller/talentController')
const { authentication, authorization } = require('../middleware/auth')

router.get('/admin', authentication, talentController.getAllTalent)

router.get('/detail/:id', authentication, talentController.getTalentDetail)

router.post('/add', authentication, authorization, talentController.createNewTalent)

router.patch('/update/:id', authentication, authorization, talentController.updateTalent)

router.delete('/delete/:id', authentication, authorization, talentController.deleteTalent)

module.exports = router