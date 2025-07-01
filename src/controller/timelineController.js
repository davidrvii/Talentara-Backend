const timelineModel = require('../models/timelineModels')
const response = require('../../response')

const getAllTimeline = async (req, res) => {
    try {
        const [timelines] = await timelineModel.getAllTimeline()
        response(200, {timelines: timelines}, 'Get All Timeline', res)
    } catch (error) {
        response(500, {error: error}, 'Get All Timeline: Server Error', res)
        throw error
    }
}

const getTimelineDetail = async (req, res) => {
    const { id } = req.params

    try {
        const [timeline] = await timelineModel.getTimelineDetail(id)
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
    const { id } = req.params

    try {
        const [timeline] = await timelineModel.getCurrentTimeline(id)
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
const { id } = req.params

    try {
        const [timeline] = await timelineModel.getAllTimelineProject(id)
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

const getTimelineApprovement = async (req, res) => {
    const { id } = req.params
    try {
        const [approvement] = await timelineModel.getTimelineApprovement(id)
        response(200, {approvement: approvement}, 'Get Timeline Approvement Success', res)
    } catch (error) {
        response(500, {error: error}, 'Get Timeline Approvement: Server Error', res)
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
    const { id } = req.params
    const { body } = req

    try {
        await timelineModel.updateTimeline(body, id)
        response(200, {updatedTimeline: body}, 'Update Timeline Success', res)
    } catch (error) {
        response(500, {error: error}, 'Update Timeline: Server Error', res)
        throw error
    }
}

const deleteTimeline = async (req, res) => {
    const { id } = req.params

    try {
        await timelineModel.deleteTimeline(id)
        response(200, {deletedTimelineId: id}, 'Delete Timeline Success', res)
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
    getTimelineApprovement,
    createNewTimeline,
    updateTimeline,
    deleteTimeline
}