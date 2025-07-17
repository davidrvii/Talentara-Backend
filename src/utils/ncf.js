const axios = require('axios')
const { getProjectDetail } = require('../models/projectModels')
const { getFilteredTalent } = require('../models/talentModels')
const { filterProjectByRole } = require('./openai')

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

        const filteredProject = await filterProjectByRole(projectDetail, role_name)

        const payload = {
            project: {
                platform: filteredProject.platforms,
                product: filteredProject.product_types,
                role: [role_name],
                language: filteredProject.languages,
                tools: filteredProject.tools
            },
            talents: talents.map(t => ({
                talent_id: t.talent_id,
                platform: t.platforms?.split('|') ?? [],
                product: t.product_types?.split('|') ?? [],
                role: t.roles?.split('|') ?? [],
                language: t.languages?.split('|') ?? [],
                tools: t.tools?.split('|') ?? []
            }))
        }

        console.log("✅ Project payload:", JSON.stringify(payload.project, null, 2));
        console.log("✅ Talent payloads:", JSON.stringify(payload.talents, null, 2));

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
