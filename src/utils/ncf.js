const axios = require('axios')

// Kirim request ke service Python/Flask/Gradio untuk rekomendasi talent
const findRecommendedTalent = async (project_id, roleList) => {
    try {
        const response = await axios.post(//'http://localhost:5000/recommend, 
        '',{
        project_id,
        roles: roleList
        })

        // { "Frontend Developer": [talent_id1, ...], ... }
        return response.data.recommendations
    } catch (error) {
        throw new Error('Failed to get recommendation from NCF model')
    }
};

module.exports = { findRecommendedTalent }