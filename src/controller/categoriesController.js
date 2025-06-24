const categoriesModel = require('../models/categoriesModels')
const response = require('../../response')

const getAllCategories = async (req, res) => {
    try {
        const [feature] = await categoriesModel.getAllFeature()
        const [platform] = await categoriesModel.getAllPlatform()
        const [productType] = await categoriesModel.getAllProductType()
        const [role] = await categoriesModel.getAllRole()
        const [language] = await categoriesModel.getAllLanguage()
        const [tools] = await categoriesModel.getAllTools()
        response(200, {feature, platform, productType, role, language,tools}, 'Get All Categories Success', res)
    } catch (error) {
        response(500, {error: error}, 'Get All Categories: Server Error', res)
        throw error
    }
}

const getAllFeature = async (req, res) => {
    try {
        const [feature] = await categoriesModel.getAllFeature()
        response(200, {feature: feature}, 'Get All Feature Success', res)
    } catch (error) {
        response(500, {error: error}, 'Get All Feature: Server Error', res)
        throw error
    }
}

const getAllPlatform = async (req, res) => {
    try {
        const [platform] = await categoriesModel.getAllPlatform()
        response(200, {platform: platform}, 'Get All Platform Success', res)
    } catch (error) {
        response(500, {error: error}, 'Get All Platform: Server Error', res)
        throw error
    }
}

const getAllProductType = async (req, res) => {
    try {
        const [productType] = await categoriesModel.getAllProductType()
        response(200, {productType: productType}, 'Get All Product Type Success', res)
    } catch (error) {
        response(500, {error: error}, 'Get All Product Type: Server Error', res)
        throw error
    }
}

const getAllRole = async (req, res) => {
    try {
        const [role] = await categoriesModel.getAllRole()
        response(200, {role: role}, 'Get All Role Success', res)
    } catch (error) {
        response(500, {error: error}, 'Get All Role: Server Error', res)
        throw error
    }
}

const getAllLanguage = async (req, res) => {
    try {
        const [language] = await categoriesModel.getAllLanguage()
        response(200, {language: language}, 'Get All Language Success', res)
    } catch (error) {
        response(500, {error: error}, 'Get All Language: Server Error', res)
        throw error
    }
}

const getAllTools = async (req, res) => {
    try {
        const [tools] = await categoriesModel.getAllTools()
        response(200, {tools: tools}, 'Get All Tools Success', res)
    } catch (error) {
        response(500, {error: error}, 'Get All Tools: Server Error', res)
        throw error
    }
}

module.exports = {
    getAllCategories,
    getAllFeature,
    getAllPlatform,
    getAllProductType,
    getAllRole,
    getAllLanguage,
    getAllTools
}