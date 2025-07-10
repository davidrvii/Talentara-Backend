const { hashedPassword, comparedPassword } = require('../utils/bcrypt')
const userModel = require('../models/userModels')
const response = require('../../response')
const { generateToken } = require('../utils/jwt')

const getAllUser = async (req, res) => {
    try {
        const [users] = await userModel.getAllUser()

        users.forEach(user => {
            if (user.user_image) {
                user.user_image = `https://${req.get('host')}/uploads/images/${user.user_image}`
            }
        });

        response(200, {users: users}, 'Get All User Success', res)
    } catch (error) {
        response(500, {error: error}, 'Get All User: Server Error', res)
        throw error
    }
}

const getUserDetail = async (req, res) => {
    const { id } = req.params

    try {
        const [user] = await userModel.getUserDetail(id)
        if (user.length === 0 ) {
            return response(404, {usersDetail: null}, 'Get User Detail: User Not Found', res)
        } else {
            user.forEach(u => {
                if (u.user_image) {
                    u.user_image = `https://${req.get('host')}/uploads/images/${u.user_image}`
                }
            });

            return response(200, {userDetail: user}, 'Get User Detail Success', res)
        }
    } catch (error) {
        response(500, {error: error}, 'Get User Detail: Server Error', res)
        throw error
    }
}

const getUserBasic = async (req, res) => {
    const { id } = req.params

    try {
        const [user] = await userModel.getUserBasic(id)
        if (user.length === 0 ) {
            return response(404, {usersBasic: null}, 'Get User Basic: User Not Found', res)
        } else {
            const baseUrl = `https://${req.get('host')}`;
            const formattedUsers = user.map(u => ({
                ...u,
                user_image: u.user_image ? `${baseUrl}/uploads/images/${u.user_image}` : null
            }));
            return response(200, {usersBasic: formattedUsers}, 'Get User Basic Success', res)
        }
    } catch (error) {
        response(500, {error: error}, 'Get User Basic: Server Error', res)
        throw error
    }
}

const userRegister = async (req, res) => {
    const { body } = req

    try {
        const password = hashedPassword(body.user_password)
        const newUser = {
            ...body,
            user_password: password
        }
        await userModel.userRegister(newUser)
        response(201, {registResult: body}, 'Create New User Success', res)
    } catch (error) {
        response(500, {error: error}, 'Create New User: Server Error', res)
        throw error
    }
}

const userLogin = async (req, res) => {
    const { user_email, user_password } = req.body

    try {
        const [userLogin] = await userModel.userLogin(user_email)
        if (userLogin.length === 0) {
            return response(401, {loginResult: null}, 'User Login: Invalid Email', res)
        }
        const user = userLogin[0]
        
        const isPasswordMatch = comparedPassword(user_password, user.user_password)
        if (!isPasswordMatch) {
            return response(401, {loginResult: null}, 'User Login: Invalid Password', res)
        }

        const user_id = user.user_id
        const user_name = user.user_name

        const token = generateToken({user_id: user.user_id, user_email: user.user_email})

        response(200, {loginResult: {user_id, user_email, user_name, token}}, 'User Login Success', res)
    } catch (error) {
        response(500, {error: error}, 'User Login: Server Error', res)
        throw error
    }
}

const updateUser = async (req, res) => {
    const { id } = req.params
    const body = req.body
    const file = req.file || (req.files?.user_image?.[0])

    console.log('FILE:', req.file);
    console.log('BODY:', req.body);


    if (file) {
        body.user_image = file.filename
    }

    try {
        await userModel.updateUser(body, id)
        response(200, {updatedUser: body}, 'Update User Success', res)
    } catch (error) {
        response(500, {error: error}, 'Update User: Server Error', res)
        throw error
    }
}

const saveFcmToken = async (req, res) => {
    const { fcm_token } = req.body
    console.log(`Body: ${req.body}`)
    console.log(`FCM Token: ${fcm_token}`)

    const user_id = req.userData.user_id
    console.log((`User ID: ${user_id}`))

    try {
        await userModel.saveFcmToken(user_id, fcm_token)
        response(200, {fcmToken: fcm_token}, 'FCM Token Saved Successfully', res)
    } catch (error) {
        response(500, {error: error}, 'Error Saving FCM Token: Server Error', res)
        throw error
    }
}

const deleteUser = async (req, res) => {
    const { id } = req.params

    try {
        await userModel.deleteUser(id)
        response(200, {deletedUserId: id}, 'Delete User Success', res)
    } catch (error) {
        response(500, {error: error}, 'Delete User: Server Error', res)
        throw error
    }
}

module.exports = {
    getAllUser,
    getUserDetail,
    getUserBasic,
    userRegister,
    userLogin,
    updateUser,
    saveFcmToken,
    deleteUser
}

