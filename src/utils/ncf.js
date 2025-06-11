const axios = require('axios')
const { getProjectDetail } = require('../models/projectModels')
const { getFilteredTalent } = require('../models/talentModels')

async function findRecommendedTalent(project_id, role_name, excludeIds = []) {
    try {
        const projectDetail = await getProjectDetail(project_id)
        const talents = await getFilteredTalent(role_name, excludeIds)

        if (talents.length === 0) {
            console.log('No eligible talents found for this role.')
            return []
        }

        const payload = {
            project: projectDetail,
            talents: talents
        }

        console.log(`Calling NCF API with ${talents.length} talents...`)

        const response = await axios.post(
            'https://talentara-ncf-production.up.railway.app/rank_talent', 
            payload
        )

        const rankedTalents = response.data

        // Map talent_id to talent object
        const rankedTalentObjects = rankedTalents.map(rank => {
            const talentObj = talents.find(t => t.talent_id === rank.talent_id)
            return {
                ...talentObj,
                id: rank.talent_id,
                score: rank.score
            }
        })

        return rankedTalentObjects
    } catch(error) {
        console.error('Error in findRecommendedTalent:', error.message)
        return [] 
    }
    
}

module.exports = {
    findRecommendedTalent
}
