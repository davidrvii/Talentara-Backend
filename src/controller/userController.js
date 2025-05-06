const { hashPassword, comparedPassword, comparedUsername } = require('../utils/bcrypt')
const userModel = require('../models/userModels')
const response = require('../../response')
const { generateToken } = require('../utils/jwt')

const getAllUser = async (req, res) => {

}

const getUserDetail = async (req, res) => {
    
}

const userRegister = async (req, res) => {
    
}

const userLogin = async (req, res) => {
    
}

const updateUser = async (req, res) => {
    
}

const deleteUser = async (req, res) => {
    
}

module.exports = {
    getAllUser,
    getUserDetail,
    userRegister,
    userLogin,
    updateUser,
    deleteUser
}

