const dbPool = require('../config/database')

//Get All User From Database (Testing-Only)
const getAllUser = () => {
    const sqlQuery = `SELECT * FROM user`

    return dbPool.execute(sqlQuery)
}

//Get a User Detail By ID
const getUserDetail = (user_id) => {
    const sqlQuery =   `SELECT * FROM user 
                        WHERE user_id = ?`

    return dbPool.execute(sqlQuery, [user_id])
}

//Get a User Name and Image By ID For Homepage
const getUserBasic = (user_id) => {
    const sqlQuery =   `SELECT user_name, user_image 
                        FROM user 
                        WHERE user_id = ?`

    return dbPool.execute(sqlQuery, [user_id])
}

//Create a New User
const userRegister = (body) => {
    const sqlQuery =   `INSERT INTO user (user_name, user_email, user_password)
                        VALUES (?, ?, ?)`

    return dbPool.execute(sqlQuery, [body.user_name, body.user_email, body.user_password])
}

//Get a User Using Email and Password To Login
const userLogin = (user_email) => {
    const sqlQuery =   `SELECT * FROM user 
                        WHERE user_email = ?`;

    return dbPool.execute(sqlQuery, [user_email]);
}

//Update a User By ID
const updateUser = (body, user_id) => {
    const keys = Object.keys(body);
    const values = Object.values(body);

    //Custom Query Following By User Input
    const fields = keys.map(key => `${key} = ?`).join(', ')
    const sqlQuery = `UPDATE user SET ${fields} WHERE user_id = ?`

    return dbPool.execute(sqlQuery, [...values, user_id])
}

//Delete a User By ID (Testing-Only)
const deleteUser = (user_id) => {
    const  sqlQuery = `DELETE FROM user WHERE user_id = ?`

    return dbPool.execute(sqlQuery, [user_id])
}

module.exports = {
    getAllUser,
    getUserDetail,
    getUserBasic,
    userRegister,
    userLogin,
    updateUser,
    deleteUser
}