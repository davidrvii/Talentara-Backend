const { inviteTalent } = require('../controller/projectController')

// Endpoint testing
const testInviteTalent = async (req, res) => {
    const { project_id, role_name, role_amount, exclude_ids } = req.body

    try {
        const result = await inviteTalent(project_id, role_name, role_amount, exclude_ids || [])
        res.status(200).json({
            message: 'Talent successfully invited',
            invited_talent_ids: result
        })
    } catch (error) {
        console.error('Error in testInviteTalent:', error)
        res.status(500).json({ message: 'Internal Server Error', error: error.message })
    }
}

module.exports = {
    testInviteTalent
}
