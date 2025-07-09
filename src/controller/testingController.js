const { inviteTalent } = require('../controller/projectController')
const response = require('../../response')

// Endpoint testing
const testInviteTalent = async (req, res) => {
    const { body } = req
    console.log('FULL REQ BODY:', req.body)

    try {
        const invitedTalentIds = await inviteTalent(body.project_id, body.role_name, body.role_amount, body.exclude_ids || [])
        
        if (invitedTalentIds.length === 0) {
            return response(404, { invitedTalentIds }, 'No suitable talent found for this role', res)
        }

        response(200, { invitedTalentIds }, 'Invite Talent Success', res)
    } catch (error) {
        console.error('Error in testInviteTalent:', error.message)
        response(500, { error: error.message }, 'Invite Talent: Server Error', res)
    }
};

module.exports = {
    testInviteTalent
}
