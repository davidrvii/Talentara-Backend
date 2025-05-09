const dbPool = require('../config/database')
const { uploadPortfolio, getOrCreateIdByName } = require('../models/portfolioModels')

const getAllTalent = () => {
    const sqlQuery = `SELECT * FROM talent`
    
    return dbPool.execute(sqlQuery)
}

const getTalentDetail = (talent_id) => {
    const sqlQuery =   `SELECT * FROM talent
                        WHERE talent_id = ?`

    return dbPool.execute(sqlQuery, [talent_id])
}

const createNewTalent = async (body, user_id) => {
    const conn = await dbPool.getConnection() //membuat koneksi khusus
    await conn.beginTransaction() //menjadi semua query ke dalam satu transaksi

    try {
        //membuat talent baru dan mengambil id yang baru dibuat dari hasil query
        const [talentRes] = await conn.execute(
            `INSERT INTO talent (user_id) VALUES (?)`,
            [user_id]
        ) 
        const talent_id = talentRes.insertId

        //insert talent's roles
        for (const roleName of body.roles || []) {
            const role_id = await getOrCreateIdByName('role', 'role_name', 'role_id', roleName)
            if (role_id) {
                await conn.execute(
                `INSERT INTO talent_has_role (talent_id, role_id) VALUES (?, ?)`, 
                [talent_id, role_id])
            }
        }

        //insert talent's tools
        for (const toolName of body.tools || []) {
            const tools_id = await getOrCreateIdByName('tools', 'tools_name', 'tools_id', toolName)
            if (tools_id) {
                await conn.execute(
                `INSERT INTO talent_has_tools (talent_id, tools_id) VALUES (?, ?)`, 
                [talent_id, tools_id])
            }
        }

        //insert talent's platforms
        for (const platformName of body.platforms || []) {
            const platform_id = await getOrCreateIdByName('platform', 'platform_name', 'platform_id', platformName)
            if (platform_id) {
                await conn.execute(
                `INSERT INTO talent_has_platform (talent_id, platform_id) VALUES (?, ?)`, 
                [talent_id, platform_id])
            }
        }   

        //insert talent's product types
        for (const productTypeName of body.product_types || []) {
            const product_type_id = await getOrCreateIdByName('product_type', 'product_type_name', 'product_type_id', productTypeName)
            if (product_type_id) {
                await conn.execute(
                `INSERT INTO talent_has_product_type (talent_id, product_type_id) VALUES (?, ?)`, 
                [talent_id, product_type_id])
            }
        }

        //insert talent's languages
        for (const languageName of body.languages || []) {
            const language_id = await getOrCreateIdByName('language', 'language_name', 'language_id', languageName)
            if (language_id) {
                await conn.execute(
                `INSERT INTO talent_has_language (talent_id, language_id) VALUES (?, ?)`, 
                [talent_id, language_id])
            }
        }

        for (const portfolio of body.portfolio || []) {
            await uploadPortfolio(conn, portfolio, talent_id)
        }

        await conn.commit() //mengkonfirmasi semua query
        conn.release() //mengembalikan koneksi

        return { success: true, message: 'Talent Registered Successfully' }

    } catch (error) {
        await conn.rollback() //membatalkan semua query ketika terjadi error
        conn.release() //mengembalikan koneksi
        throw error
    }
}

const updateTalent = (body, talent_id) => {
    const keys = Object.keys(body);
    const values = Object.values(body);
    
    const fields = keys.map(key => `${key} = ?`).join(', ')
    const sqlQuery = `UPDATE talent SET ${fields} WHERE talent_id= ?`
    
    return dbPool.execute(sqlQuery, [...values, talent_id])
}

const deleteTalent = (talent_id) => {
    const sqlQuery = `DELETE FROM talent WHERE talent_id = ?`

    return dbPool.execute(sqlQuery, [talent_id])
}

module.exports = {
    getAllTalent,
    getTalentDetail,
    createNewTalent,
    updateTalent,
    deleteTalent
}