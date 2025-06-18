const { verifyToken } =  require('../utils/jwt')
const userModel = require('../models/userModels')
const response = require('../../response')

const authentication = async (req, res, next) => {
    try {
        const  authHeader = req.headers['Authorization'] || req.headers['authorization']

        if(!authHeader || !authHeader.startsWith('Bearer ')) {
            return response(401, {authenticationHeader: authHeader}, 'Bearer Token Not Provided', res)
        }
        
        const token = authHeader.split(' ')[1]
        const decoded = verifyToken(token)

        const [userRows] = await userModel.userLogin(decoded.user_email)
        if(userRows.length === 0){
            return response(401, {authenticatedUser: userRows}, 'Authentication : User Not Found', res)
        } 

        const user = userRows[0]
        req.userData = {
            user_id: user.user_id,
            user_email: user.user_email
        }
        next()
    } catch(error){
        response(500, {error: error}, "Internal Server Error: Authentication Failed", res)
        throw error
    }
}

const authorization = async (req, res, next) => {
    try {
        const[userRows] = await userModel.userLogin(req.userData.user_email)
        if(userRows.length === 0){
            return response(403, {authorizedUser: userRows}, "Authorization: Access Denied", res)
        }
        next()
    } catch(error){
        response(500, {error: error}, "Internal Server Error: Authorization Failed", res)
        throw error
    }
}

module.exports = {
    authentication,
    authorization
}