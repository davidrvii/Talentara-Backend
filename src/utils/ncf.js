const axios = require('axios')
const { getProjectDetail } = require('../models/projectModels')
const { getFilteredTalent } = require('../models/talentModels')

async function findRecommendedTalent(project_id, role_name, excludeIds = []) {
    try {
        const [projectRows] = await getProjectDetail(project_id)
        const projectDetail = projectRows[0]
        
        const [talents] = await getFilteredTalent(role_name, excludeIds)

        console.log('Filtered Talents:', JSON.stringify(talents, null, 2))
        console.log('Project Detail:', JSON.stringify(projectDetail, null, 2))


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
        console.log('NCF Response:', JSON.stringify(response.data, null, 2));


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
