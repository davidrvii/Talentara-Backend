const express = require('express')
const router = express.Router()
const { testInviteTalent } = require('../controller/testingController')

router.post('/invite', testInviteTalent)

module.exports = router
