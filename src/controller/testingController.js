const { inviteTalent } = require('../controller/projectController')
const response = require('../../response')

// Endpoint testing
const testInviteTalent = async (req, res) => {
    const { project_id, role_name, role_amount, exclude_ids } = req.body

    try {
        const invitedTalentIds = await inviteTalent(project_id, role_name, role_amount, exclude_ids || [])
        
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
