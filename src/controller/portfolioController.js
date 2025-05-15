const portfolioModel = require('../models/portfolioModels')
const response = require('../../response')

const getAllPortfolio = async (req, res) => {
    try {
        const [portfolios] = await portfolioModel.getAllPortfolio()
        response(200, {portfolios: portfolios}, 'Get All Portfolio'. res)
    } catch (error) {
        response(500, {error: error}, 'Get All Portfolio: Server Error', res)
        throw error
    }
}

const getAllTalentPortfolio = async (req, res) => {
    const { talent_id } = req.body

    try {
        const [portfolio] = await portfolioModel.getAllTalentPortfolio(talent_id)
        if (portfolio.length === 0) {
            return response(404, {talentPortfolio: null}, 'Get All Talent Portfolio Detail: Portfolio Not Found', res)
        } else {
            response(200, {talentPortfolio: portfolio}, 'Get All Talent Portfolio Detail Success', res)
        }
    } catch (error) {
        response(500, {error: error}, 'Get Portfolio Detail: Server Error', res)
        throw error
    }
}

const getPortfolioDetail = async (req, res) => {
    const { portfolio_id } = req.body

    try {
        const [portfolio] = await portfolioModel.getPortfolioDetail(portfolio_id)
        if (portfolio.length === 0) {
            return response(404, {portfolioDetail: null}, 'Get Portfolio Detail: Portfolio Not Found', res)
        } else {
            response(200, {portfolioDetail: portfolio}, 'Get Portfolio Detail Success', res)
        }
    } catch (error) {
        response(500, {error: error}, 'Get Portfolio Detail: Server Error', res)
        throw error
    }
}

const createNewPortfolio = async (req, res) => {
    const { body, talent_id } = req

    try {
        await portfolioModel.createNewPortfolio(body, talent_id)
        response(201, {newPortfolio: body}, 'Create New Portfolio Success', res)
    } catch (error) {
        response(500 , {error: error}, 'Create New Portfolio: Server Error', res)
        throw error
    }
}

const updatePortfolio = async (req, res) => {
    const { portfolio_id } = req.params
    const { body } = req

    try {
        await portfolioModel.updatePortfolio(body, portfolio_id)
        response(200, {updatedPortfolio: body}, 'Update Portfolio Success', res)
    } catch (error) {
        response(500, {error: error}, 'Update Portfolio: Server Error', res)
        throw error
    }
}

const deletePortfolio = async (req, res) => {
    const { portfolio_id } = req.params

    try {
        await portfolioModel.deletePortfolio(portfolio_id)
        response(200, {deletedPortfolioId: portfolio_id}, 'Delete Portfolio Success', res)
    } catch (error) {
        response(500, {error: error}, 'Delete Portfolio: Server Error', res)
        throw error
    }
}

module.exports = {
    getAllPortfolio,
    getAllTalentPortfolio,
    getPortfolioDetail,
    createNewPortfolio,
    updatePortfolio,
    deletePortfolio
}