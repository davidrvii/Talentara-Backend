const projectModel = require('../models/projectModels')
const timelineModel = require('../models/timelineModels')
const talentModel = require('../models/talentModels')
const response = require('../../response')
const { generateProjectAnalysis } = require('../utils/openai')
const { findRecommendedTalent } = require('../utils/ncfRecommender')

const getAllProject = async (req, res) => {
    try {
        const [projects] = await projectModel.getAllProject()
        response(200, {projects: projects}, 'Get All Project'. res)
    } catch (error) {
        response(500, {error: error}, 'Get All Project: Server Error', res)
        throw error
    }
}

const getAllProjectHistory = async (req, res) => {
    const { talent_id } = req.body

    try {
        const [project] = await projectModel.getAllProjectHistory(talent_id)
        if (project.length === 0) {
            return response(404, {historyProject: null}, 'Get All Project History: Project History Not Found', res)
        } else {
            response(200, {historyProject: project}, 'Get All Project History Success', res)
        }
    } catch (error) {
        response(500, {error: error}, 'Get Project History: Server Error', res)
        throw error
    }
}

const getProjectOrder = async (req, res) => {
    const { project_id } = req.body

    try {
        const [project] = await projectModel.getProjectOrder(project_id)
        if (project.length === 0) {
            return response(404, {projectOrder: null}, 'Get Project Order: Project Not Found', res)
        } else {
            response(200, {projectOrder: project}, 'Get Project Order Success', res)
        }
    } catch (error) {
        response(500, {error: error}, 'Get Project Order: Server Error', res)
        throw error
    }
}

const getProjectDetail = async (req, res) => {
    const { project_id } = req.body

    try {
        const [project] = await projectModel.getProjectDetail(project_id)
        if (project.length === 0) {
            return response(404, {projectDetail: null}, 'Get Project Detail: Project Not Found', res)
        } else {
            response(200, {projectDetail: project}, 'Get Project Detail Success', res)
        }
    } catch (error) {
        response(500, {error: error}, 'Get Project Detail: Server Error', res)
        throw error
    }
}

const createNewProject = async (req, res) => {
    const { 
        project_name, 
        project_desc, 
        start_date, 
        end_date,
        user_id
    } = req.body
    try {
        const parsed = await generateProjectAnalysis(project_desc, start_date, end_date)

        // Persiapkan data untuk insert project
        const newProjectBody = {
            project_name,
            project_desc: parsed.generated_desc,
            start_date,
            end_date,
            platform: parsed.platforms,
            product_type: parsed.product_types,
            role: parsed.roles,
            language: parsed.languages,
            tools: parsed.tools,
            feature: parsed.features,
        }
    
        // Insert project
        const projectResult = await projectModel.createNewProject(newProjectBody, user_id);
        const project_id = projectResult.project_id

        for (const phase of parsed.timeline) {
            await timelineModel.createNewTimeline({
                project_id,
                project_phase: phase.project_phase,
                start_date: phase.start_date,
                end_date: phase.end_date
            })
        }

        response(201, {newProject: newProjectBody}, 'Create New Project Success', res)
    } catch (error) {
        response(500 , {error: error}, 'Create New Project: Server Error', res)
        throw error
    }
}

//Finalized Project By Project Leader
//Update Platform, Product Type, Role (Amount), Language, Tools and Feature For Talent Filtering 
const updateProject = async (req, res) => {
    const { project_id } = req.params
    const { body } = req

    try {
        await projectModel.updateProject(body, project_id)
        
        const recommendations = await findRecommendedTalent(project_id, body.roles)
        // Lanjutkan: kirim notifikasi ke talent sesuai `recommendations`

        response(200, {updatedProject: body}, 'Update Project Success', res)
    } catch (error) {
        response(500, {error: error}, 'Update Project: Server Error', res)
        throw error
    }
}

// Talent Accept or Decline Project
const respondToProjectOffer = async (req, res) => {
    const { project_id, talent_id, role_id, accept } = req.body;

    try {
        if (accept === true) {
        await projectModel.insertToProjectHasTalent(project_id, talent_id, role_id)
        return response(200, { accepted: true }, 'Talent accepted the project', res)
        } else {
        const [updated] = await talentModel.updateTalentDeclineCount(talent_id)
        const newDeclineCount = updated?.affectedRows > 0 ? updated : null
        return response(200, {accepted: false, project_declined: newDeclineCount}, 'Talent declined the project', res)
        }
    } catch (error) {
        response(500, { error }, 'Respond To Project Offer: Server Error', res)
        throw error
    }
}

const deleteProject = async (req, res) => {
    const { project_id } = req.params

    try {
        await projectModel.deleteProject(project_id)
        response(200, {deletedProjectId: project_id}, 'Delete Project Success', res)
    } catch (error) {
        response(500, {error: error}, 'Delete Project: Server Error', res)
        throw error
    }
}

module.exports = {
    getAllProject,
    getAllProjectHistory,
    getProjectOrder,
    getProjectDetail,
    createNewProject,
    updateProject,
    respondToProjectOffer,
    deleteProject
}