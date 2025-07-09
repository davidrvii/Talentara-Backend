const router = require('express').Router()
const { testInviteTalent } = require('../controller/testingController')

router.post('/invite', testInviteTalent)

module.exports = router
