const projectModel = require('../models/projectModels')
const timelineModel = require('../models/timelineModels')
const response = require('../../response')
const { generateProjectAnalysis } = require('../utils/openai')
const { findRecommendedTalent } = require('../utils/ncf')

const getAllProject = async (req, res) => {
    try {
        const [projects] = await projectModel.getAllProject()
        response(200, {projects: projects}, 'Get All Project Success', res)
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

const getCurrentProject = async (req, res) => {
    const { id } = req.params

    try {
        const [project] = await projectModel.getCurrentProject(id)
        if (project.length === 0) {
            return response(404, {currentProject: null}, 'Get Current Project: Project Not Found', res)
        } else {
            response(200, {currentProject: project}, 'Get Current Project Success', res)
        }
    } catch (error) {
        response(500, {error: error}, 'Get Current Project: Server Error', res)
        throw error
    }
}

const getAccessLevel = async (req, res) => {
    const user_id = req.userData.user_id
    const { id } = req.params

    try {
        let access
        const [role] = await projectModel.getAccessLevel(id, user_id)
        if (role.length > 0) {
            const roleName = role[0].role_name
            access = roleName
        } else {
            access = "Client"
        }
        response(200, {access: access}, 'Get Access Level Success', res)
    } catch (error) {
        response(500, {error: error}, 'Get Access Level: Server Error', res)
    }
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
            platforms: parsed.platforms,
            product_types: parsed.product_types,
            roles: parsed.roles,
            languages: parsed.languages,
            tools: parsed.tools,
            features: parsed.features,
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
        const [requiredRoles] = await projectModel.getProjectRoleRequirement(project_id)
        const role = requiredRoles.find(r => r.role_name === role_name)
        const countRoles = await projectModel.countAcceptedTalentsByRole(project_id)
        const count = countRoles.find(r => r.role_name === role_name)

        if (!accept) {
            // Decline: retry invite for declined role
            await inviteTalent(project_id, role_name, role.role_amount, [talent_id])
            return response(200, { accepted: false }, 'Talent Declined and Retrying Invite', res)
        }

        // Talent Late Accept Handling
        if (count >= role.role_amount) {
            await teamFullPushNotification(talent_id, project_id, role_name)
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
            await projectModel.updateProjectStatus(project_id, 3)
            const team = await projectModel.getFullTeam(project_id)
            await Promise.all(
                team.map(t => projectStartedPushNotification(t.id, project_id, role_name))
            )
            return response(200, { accepted: true, next: 'project_started' }, 'Project Started', res)
        }
        return response(200, { accepted: true, next: 'waiting_for_team' }, 'Talent Accepted', res)
    } catch (error) {
        response(500, { error }, 'Respond To Project Offer: Server Error', res)
        throw error
    }
}

async function teamFullPushNotification(talent_id, project_id, role_name) {
    await notificationModel.createNewNotification({
        user_id: userId,
        notification_title: 'Team Already Full',
        notification_desc: `Sorry, ${role_name} role for this project is full filled`,
        notification_type: 'PROJECT_FULL',
        reference_id: project_id,
        click_action: 'NONE'
    })

    const token = await projectModel.getTalentDeviceToken(talent_id)
    if (!token) {
    console.warn(`No FCM token for talent ${talent_id}, skipping notification`)
    return
    }

    const message = {
        token: token,
        android: { priority: 'high' },
        notification: {
            title: 'Team Already Full',
            body: `Sorry, ${role_name} role for this project is full filled`
        },
        data: { 
            notification_type: 'PROJECT_OFFER',
            reference_id: project_id.toString(),
            click_action: 'OPEN_PROJECT_OFFER'
        }
    };

    try {
        await admin.messaging().send(message);
        console.log('Notification sent successfully');
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

async function projectStartedPushNotification(talent_id, project_id, role_name) {
    await notificationModel.createNewNotification({
        user_id: userId,
        notification_title: 'Project Started',
        notification_desc: `Project has officially started`,
        notification_type: 'PROJECT_STARTED',
        reference_id: project_id,
        click_action: 'OPEN_PROJECT_DETAIL'
    })

    const token = await projectModel.getTalentDeviceToken(talent_id)
    if (!token) {
    console.warn(`No FCM token for talent ${talent_id}, skipping notification`)
    return
    }

    const message = {
        token: token,
        android: { priority: 'high' },
        notification: {
            title: 'Project Started',
            body: `Project has officially started`
        },
        data: { 
            notification_type: 'PROJECT_STARTED',
            reference_id: project_id.toString(),
            click_action: 'OPEN_PROJECT_DETAIL'
        }
    };

    try {
        await admin.messaging().send(message);
        console.log('Notification sent successfully');
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

async function getProjectPushNotification(talent_id, project_id, role_name) {
    await notificationModel.createNewNotification({
        user_id: userId,
        notification_title: 'You Got New Project!',
        notification_desc: `You are invited to a project as a ${role_name}`,
        notification_type: 'PROJECT_OFFER',
        reference_id: project_id,
        click_action: 'OPEN_PROJECT_OFFER'
    })

    const token = await projectModel.getTalentDeviceToken(talent_id)
    if (!token) {
    console.warn(`No FCM token for talent ${talent_id}, skipping notification`)
    return
    }

    const message = {
        token: token,
        android: { priority: 'high' },
        notification: {
            title: 'You Got New Project!',
            body: `You are invited to a project as a ${role_name}`
        },
        data: { 
            notification_type: 'PROJECT_OFFER',
            reference_id: project_id.toString(),
            click_action: 'OPEN_PROJECT_OFFER'
        }
    };

    try {
        await admin.messaging().send(message);
        console.log('Notification sent successfully');
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

async function inviteTalent(project_id, role_name, role_amount, excludeIds = []) {
    const candidates = await findRecommendedTalent(project_id, role_name, excludeIds)
    const selected = candidates.slice(0, role_amount)
    for (const talent of selected) {
        await getProjectPushNotification(talent.id, project_id, role_name)
    }
    return selected.map(t => t.id)
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
    getCurrentProject,
    getAccessLevel,
    createNewProject,
    updateProject,
    respondToProjectOffer,
    deleteProject
}