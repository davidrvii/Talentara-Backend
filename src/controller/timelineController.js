const timelineModel = require('../models/timelineModels')
const response = require('../../response')

const getAllTimeline = async (req, res) => {
    try {
        const [timelines] = await timelineModel.getAllTimeline()
        response(200, {timelines: timelines}, 'Get All Timeline'. res)
    } catch (error) {
        response(500, {error: error}, 'Get All Timeline: Server Error', res)
        throw error
    }
}

const getTimelineDetail = async (req, res) => {
    const { timeline_id } = req.body

    try {
        const [timeline] = await timelineModel.getTimelineDetail(timeline_id)
        if (timeline.length === 0) {
            return response(404, {timelineDetail: null}, 'Get Timeline Detail: Timeline Not Found', res)
        } else {
            response(200, {timelineDetail: timeline}, 'Get Timeline Detail Success', res)
        }
    } catch (error) {
        response(500, {error: error}, 'Get Timeline Detail: Server Error', res)
        throw error
    }
}

const getCurrentTimeline = async (req, res) => {
    const { project_id } = req.body

    try {
        const [timeline] = await timelineModel.getCurrentTimeline(project_id)
        if (timeline.length === 0) {
            return response(404, {currentTimeline: null}, 'Get Current Timeline: Timeline Not Found', res)
        } else {
            response(200, {currentTimeline: timeline}, 'Get Current Timeline Success', res)
        }
    } catch (error) {
        response(500, {error: error}, 'Get Current Timeline: Server Error', res)
        throw error
    }
}

const getAllTimelineProject = async (req, res) => {
const { project_id } = req.body

    try {
        const [timeline] = await timelineModel.getAllTimelineProject(project_id)
        if (timeline.length === 0) {
            return response(404, {timelineProject: null}, 'Get All Timeline Project: Timeline Not Found', res)
        } else {
            response(200, {timelineProject: timeline}, 'Get All Timeline Project Success', res)
        }
    } catch (error) {
        response(500, {error: error}, 'Get All Timeline Project: Server Error', res)
        throw error
    }
}

const createNewTimeline = async (req, res) => {
    const { body } = req
    try {
        await timelineModel.createNewTimeline(body)
        response(201, {newTimeline: body}, 'Create New Timeline Success', res)
    } catch (error) {
        response(500 , {error: error}, 'Create New Timeline: Server Error', res)
        throw error
    }
}

const updateTimeline = async (req, res) => {
    const { timeline_id } = req.params
    const { body } = req

    try {
        await timelineModel.updateTimeline(body, timeline_id)
        response(200, {updatedTimeline: body}, 'Update Timeline Success', res)
    } catch (error) {
        response(500, {error: error}, 'Update Timeline: Server Error', res)
        throw error
    }
}

const deleteTimeline = async (req, res) => {
    const { timeline_id } = req.params

    try {
        await timelineModel.deleteTimeline(timeline_id)
        response(200, {deletedTimelineId: timeline_id}, 'Delete Timeline Success', res)
    } catch (error) {
        response(500, {error: error}, 'Delete Timeline: Server Error', res)
        throw error
    }
}

module.exports = {
    getAllTimeline,
    getTimelineDetail,
    getCurrentTimeline,
    getAllTimelineProject,
    createNewTimeline,
    updateTimeline,
    deleteTimeline
}