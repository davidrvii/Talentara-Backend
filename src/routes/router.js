const router = require('express').Router()

const userRoutes = require('./userRoutes')
const talentRoutes = require('./talentRoutes')
const projectRoutes = require('./projectRoutes')
const notificationRoutes = require('./notificationRoutes')
const timelineRoutes = require('./timelineRoutes')
const portfolioRoutes = require('./portfolioRoutes')

router.get('/', (req, res) => {
    res.status(200).send("Welcome to Talentara API")
})

router.use('/user', userRoutes)
router.use('/talent', talentRoutes)
router.use('/project', projectRoutes)
router.use('/notification', notificationRoutes)
router.use('/timeline', timelineRoutes)
router.use('/portfolio', portfolioRoutes)

module.exports = router