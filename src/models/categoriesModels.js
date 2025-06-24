const dbPool = require('../config/database')

const getAllPlatform = () => {
    const sqlQuery = `SELECT platform_name FROM platform`

    return dbPool.execute(sqlQuery)
}

const getAllProductType = () => {
    const sqlQuery = `SELECT product_type_name FROM product_type`

    return dbPool.execute(sqlQuery)
}

const getAllRole = () => {
    const sqlQuery = `SELECT role_name FROM role`

    return dbPool.execute(sqlQuery)
}

const getAllLanguage = () => {
    const sqlQuery = `SELECT language_name FROM language`

    return dbPool.execute(sqlQuery)
}

const getAllTools = () => {
    const sqlQuery = `SELECT tools_name FROM tools`

    return dbPool.execute(sqlQuery)
}

const getAllFeature = () => {
    const sqlQuery = `SELECT feature_name FROM feature`

    return dbPool.execute(sqlQuery)
}

//Capitalize every first letter of words
const capitalizeWords = (str) => str.replace(/\b\w/g, char => char.toUpperCase()).trim()

//Get ID from name or insert new record if not found
const getOrCreateIdByName = async (table, nameCol, idCol, value) => {
    if (!value || typeof value !== 'string' || value.trim() === '') return null

    const formattedValue = capitalizeWords(value);

    const selectQuery = `SELECT ${idCol} FROM ${table} WHERE ${nameCol} = ?`;
    const [rows] = await dbPool.execute(selectQuery, [formattedValue]);

    if (rows.length > 0) return rows[0][idCol];

    // Insert if not found
    const insertQuery = `INSERT INTO ${table} (${nameCol}) VALUES (?)`;
    const [insertRes] = await dbPool.execute(insertQuery, [formattedValue]);
    return insertRes.insertId;
}

module.exports = {
    getAllPlatform,
    getAllProductType,
    getAllRole,
    getAllLanguage,
    getAllTools,
    getAllFeature,
    getOrCreateIdByName
}