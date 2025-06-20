const projectModel = require('../models/projectModels')
const timelineModel = require('../models/timelineModels')
const response = require('../../response')
const { generateProjectAnalysis } = require('../utils/openai')
const { findRecommendedTalent } = require('../utils/ncf')

const getAllProject = async (req, res) => {
    try {
        const [projects] = await projectModel.getAllProject()
        response(200, {projects: projects}, 'Get All Project', res)
    } catch (error) {
        response(500, {error: error}, 'Get All Project: Server Error', res)
        throw error
    }
}

const getAllProjectHistory = async (req, res) => {
    const { id } = req.params

    try {
        const [project] = await projectModel.getAllProjectHistory(id)
        if (project.length === 0) {
            return response(404, {historyProject: null}, 'Get All Project History: Project History Not Found', res)
        } else {
            return response(200, {historyProject: project}, 'Get All Project History Success', res)
        }
    } catch (error) {
        response(500, {error: error}, 'Get Project History: Server Error', res)
        throw error
    }
}

const getProjectOrder = async (req, res) => {
    const { id } = req.params

    try {
        const [project] = await projectModel.getProjectOrder(id)
        if (project.length === 0) {
            return response(404, {projectOrder: null}, 'Get Project Order: Project Not Found', res)
        } else {
            return response(200, {projectOrder: project}, 'Get Project Order Success', res)
        }
    } catch (error) {
        response(500, {error: error}, 'Get Project Order: Server Error', res)
        throw error
    }
}

const getProjectDetail = async (req, res) => {
    const { id } = req.params

    try {
        const [project] = await projectModel.getProjectDetail(id)
        if (project.length === 0) {
            return response(404, {projectDetail: null}, 'Get Project Detail: Project Not Found', res)
        } else {
            return response(200, {projectDetail: project}, 'Get Project Detail Success', res)
        }
    } catch (error) {
        response(500, {error: error}, 'Get Project Detail: Server Error', res)
        throw error
    }
}

async function inviteTalent(project_id, role_name, role_amount, excludeIds = []) {
    //Cari kandidat terurut berdasarkan skor kecocokan
    const candidates = await findRecommendedTalent(project_id, role_name, excludeIds)
    //Pilih top-N sesuai role_amount
    const selected = candidates.slice(0, role_amount)
    //Kirim notifikasi undangan ke setiap talent
    for (const talent of selected) {
        await sendPushNotification(talent.id, { type: 'PROJECT_INVITE', project_id, role_name })
    }
    //Kembalikan daftar talent yang diundang
    return selected.map(t => t.id)
}

const createNewProject = async (req, res) => {
    const { 
        status_id,
        client_name,
        project_name, 
        project_desc, 
        start_date, 
        end_date,
    } = req.body
    const user_id = req.userData.user_id
    try {
        const parsed = await generateProjectAnalysis({project_desc, start_date, end_date})
        if (!parsed) {
            return response(500, {}, 'Error generating project analysis', res)
        }       

        // Persiapkan data untuk insert project
        const newProjectBody = {
            status_id,
            client_name,
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

        //Create Project Timeline
        for (const phase of parsed.timeline) {
            await timelineModel.createNewTimeline({
                project_id,
                project_phase: phase.project_phase,
                start_date: phase.start_date,
                end_date: phase.end_date
            })
        }

        //Invite Project Manager
        await inviteTalent(project_id, 'Project Manager', 1)

        response(201, {newProject: newProjectBody}, 'Create New Project Success', res)
    } catch (error) {
        response(500 , {error: error}, 'Create New Project: Server Error', res)
        throw error
    }
}

//Finalized Project By Project Leader
//Update Platform, Product Type, Role (Amount), Language, Tools and Feature For Talent Filtering 
const updateProject = async (req, res) => {
    const { id } = req.params
    const { body } = req

    try {
        //Update Project
        await projectModel.updateProject(body, id)

        //Get project Required Role
        const requiredRole = await projectModel.getProjectRoleRequirement(id)
        
        //Parallel Role Invite
        await Promise.all(
            requiredRole.map(({ role_name, role_amount }) =>
                inviteTalent(id, role_name, role_amount)
            )
        )
        response(200, {updatedProject: body}, 'Update Project Success', res)
    } catch (error) {
        response(500, {error: error}, 'Update Project: Server Error', res)
        throw error
    }
}

// Talent Accept or Decline Project
const respondToProjectOffer = async (req, res) => {
    const { project_id, talent_id, role_name, accept } = req.body

    try {
        const requiredRoles = await projectModel.getProjectRoleRequirement(project_id)
        console.log(requiredRoles)
        const role = requiredRoles.find(r => r.role_name === role_name)
        console.log(role)
        const countRoles = await projectModel.countAcceptedTalentsByRole(project_id)
        const count = countRoles.find(r => r.role_name === role_name)

        if (!accept) {
            // Decline: retry invite for declined role
            await inviteTalent(project_id, role_name, role.role_amount, [talent_id])
            return response(200, { accepted: false }, 'Talent Declined and Retrying Invite', res)
        }

        // Talent Late Accept Handling
        if (count >= role.role_amount) {
            await sendPushNotification(talent_id, { type: 'TEAM_FULL', project_id, role_name })
            return response(200, { accepted: false, message: 'Team already full' }, 'Team Already Full', res)
        }

        // Normal accept: insert to project_has_talent
        await projectModel.insertToProjectHasTalent(project_id, talent_id, role_name)

        // Check If Every Roles Is FulFilled
        const allFulfilled = requiredRoles.every(required => {
            const accepted = countRoles.find(role => role.role_name === required.role_name)?.accepted_count || 0
            return accepted >= required.role_amount
        })

        if (allFulfilled) {
            await projectModel.updateProjectStatus(project_id, 'in_progress')
            const team = await projectModel.getFullTeam(project_id)
            await Promise.all(
                team.map(t => sendPushNotification(t.id, { type: 'PROJECT_STARTED', project_id }))
            )
            return response(200, { accepted: true, next: 'project_started' }, 'Project Started', res)
        }

        return response(200, { accepted: true, next: 'waiting_for_team' }, 'Talent Accepted', res)
    } catch (error) {
        response(500, { error }, 'Respond To Project Offer: Server Error', res)
        throw error
    }
}

const deleteProject = async (req, res) => {
    const { id } = req.params

    try {
        await projectModel.deleteProject(id)
        response(200, {deletedProjectId: id}, 'Delete Project Success', res)
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