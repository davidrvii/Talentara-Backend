const dbPool = require('../config/database')

const getAllUser = () => {
    const sqlQuery = `SELECT * FROM user`

    return dbPool.execute(sqlQuery)
}

const getUserDetail = (user_id) => {
    const sqlQuery =   `SELECT * FROM user 
                        WHERE user_id = ?`

    return dbPool.execute(sqlQuery, [user_id])
}

const getUserBasic = (user_id) => {
    const sqlQuery =   `SELECT user_name, user_image 
                        FROM user 
                        WHERE user_id = ?`

    return dbPool.execute(sqlQuery, [user_id])
}

const userRegister = (body) => {
    const sqlQuery =   `INSERT INTO user (user_name, user_email, user_password)
                        VALUES (?, ?, ?)`

    return dbPool.execute(sqlQuery, [body.user_name, body.user_email, body.user_password])
}

const userLogin = (body) => {
    const sqlQuery =   `SELECT * FROM user 
                        WHERE user_email = ? AND user_password = ?`;

    return dbPool.execute(sqlQuery, [body.user_email, body.user_password]);
}

const updateUser = (body, user_id) => {
    const keys = Object.keys(body);
    const values = Object.values(body);

    const fields = keys.map(key => `${key} = ?`).join(', ')
    const sqlQuery = `UPDATE user SET ${fields} WHERE user_id = ?`

    return dbPool.execute(sqlQuery, [...values, user_id])
}

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