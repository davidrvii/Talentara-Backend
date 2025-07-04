const talentModel = require('../models/talentModels')
const response = require('../../response')

const getAllTalent = async (req, res) => {
    try {
        const [talent] = await talentModel.getAllTalent()
        response(200, {talent: talent}, 'Get All Talent', res)
    } catch (error) {
        response(500, {error: error}, 'Get All Talent: Server Error', res)
        throw error
    }
}

const getTalentDetail = async (req, res) => {
    const { id } = req.params

    try {
        const [talent] = await talentModel.getTalentDetail(id)
        if (talent.length === 0) {
            return response(404, {talentDetail: null}, 'Get Talent Detail: Talent Not Found', res)
        } else {
            response(200, {talentDetail: talent}, 'Get Talent Detail Success', res)
        }
    } catch (error) {
        response(500, {error: error}, 'Get Talent Detail: Server Error', res)
        throw error
    }
}

const createNewTalent = async (req, res) => {
    const { body } = req
    const user_id = req.userData.user_id

    try {
        await talentModel.createNewTalent(body, user_id)
        response(201, {newTalent: body}, 'Create New Talent Success', res)
    } catch (error) {
        response(500 , {error: error}, 'Create New Talent: Server Error', res)
        throw error
    }
}

const updateTalent = async (req, res) => {
    const { id } = req.params
    const { body } = req

    try {
        await talentModel.updateTalent(body, id)
        response(200, {updatedTalent: body}, 'Update Talent Success', res)
    } catch (error) {
        response(500, {error: error}, 'Update Talent: Server Error', res)
        throw error
    }
}

const deleteTalent = async (req, res) => {
    const { id } = req.params

    try {
        await talentModel.deleteTalent(id)
        response(200, {deletedTalentId: id}, 'Delete Talent Success', res)
    } catch (error) {
        response(500, {error: error}, 'Delete Talent: Server Error', res)
        throw error
    }
}

module.exports = {
    getAllTalent,
    getTalentDetail,
    createNewTalent,
    updateTalent,
    deleteTalent
}