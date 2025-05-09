const dbPool = require('../config/database')

const getAllPortfolio = () => {
    const sqlQuery = `SELECT * FROM portfolio`
    
    return dbPool.execute(sqlQuery)
}

const getAllTalentPortfolio = (talent_id) => {
    const sqlQuery =   `SELECT * FROM portfolio
                        WHERE talent_id = ?`

    return dbPool.execute(sqlQuery, [talent_id])
}

const getPortfolioDetail = (portfolio_id) => {
    const sqlQuery =   `SELECT * FROM portfolio
                        WHERE portfolio_id = ?`

    return dbPool.execute(sqlQuery, [portfolio_id])
}

const getOrCreateIdByName = async (table, nameCol, idCol, value) => {
    if (!value || typeof value !== 'string' || value.trim() === '') return null

    const capitalizeWords = (str) => str.replace(/\b\w/g, char => char.toUpperCase()).trim()
    const formattedValue = capitalizeWords(value);

    const selectQuery = `SELECT ${idCol} FROM ${table} WHERE ${nameCol} = ?`;
    const [rows] = await dbPool.execute(selectQuery, [formattedValue]);

    if (rows.length > 0) return rows[0][idCol];

    // Insert if not found
    const insertQuery = `INSERT INTO ${table} (${nameCol}) VALUES (?)`;
    const [insertRes] = await dbPool.execute(insertQuery, [formattedValue]);
    return insertRes.insertId;
}

const createNewPortfolio = async (body, talent_id) => {
    const conn = await dbPool.getConnection() //membuat koneksi khusus
        await conn.beginTransaction() //menjadi semua query ke dalam satu transaksi

    try {
        await uploadPortfolio(conn, body, talent_id);

        await conn.commit() //mengkonfirmasi semua query
        conn.release() //mengembalikan koneksi
        return { success: true, message: 'Portfolio uploaded successfully' };

    } catch (error) {
        await conn.rollback() //membatalkan semua query ketika terjadi error
        conn.release() //mengembalikan koneksi
        throw error;
    }
}

const uploadPortfolio = async (conn, body, talent_id) => {
    const [portfolioRes] = await conn.execute(
        `INSERT INTO portfolio (talent_id, portfolio_name, portfolio_linkedin, portfolio_source, portfolio_desc)
        VALUES (?, ?, ?, ?, ?)`,
        [
            talent_id,
            body.portfolio_name,
            body.portfolio_linkedin,
            body.portfolio_source,
            body.portfolio_desc
        ]
    )
    const portfolio_id = portfolioRes.insertId

    for (const platformName of body.platforms || []) {
        const platform_id = await getOrCreateIdByName('platform', 'platform_name', 'platform_id', platformName)
        if (platform_id) {
            await conn.execute(
            `INSERT INTO portfolio_has_platform (portfolio_id, platform_id) VALUES (?, ?)`, 
            [portfolio_id, platform_id])
        }
    }

    for (const toolsName of body.tools || []) {
        const tools_id = await getOrCreateIdByName('tools', 'tools_name', 'tools_id', toolsName)
        if (tools_id) {
            await conn.execute(
            `INSERT INTO portfolio_has_tools (portfolio_id, tools_id) VALUES (?, ?)`, 
            [portfolio_id, tools_id])
        }
    }

    for (const languageName of body.languages || []) {
        const language_id = await getOrCreateIdByName('language', 'language_name', 'language_id', languageName)
        if (language_id) {
            await conn.execute(
            `INSERT INTO portfolio_has_language (portfolio_id, language_id) VALUES (?, ?)`, 
            [portfolio_id, language_id])
        }
    }

    for (const roleName of body.roles || []) {
        const role_id = await getOrCreateIdByName('role', 'role_name', 'role_id', roleName)
        if (role_id) {
            await conn.execute(
            `INSERT INTO portfolio_has_role (portfolio_id, role_id) VALUES (?, ?)`, 
            [portfolio_id, role_id])
        }
    }

    for (const productTypeName of body.product_types || []) {
        const product_type_id = await getOrCreateIdByName('product_type', 'product_type_name', 'product_type_id', productTypeName)
        if (product_type_id) {
            await conn.execute(
            `INSERT INTO portfolio_has_product_type (portfolio_id, product_type_id) VALUES (?, ?)`, 
            [portfolio_id, product_type_id])
        }
    }
}

const updatePortfolio = (body, portfolio_id) => {
    const keys = Object.keys(body);
    const values = Object.values(body);
        
    const fields = keys.map(key => `${key} = ?`).join(', ')
    const sqlQuery = `UPDATE portfolio SET ${fields} WHERE portfolio_id = ?`
        
    return dbPool.execute(sqlQuery, [...values, portfolio_id])
}

const deletePortfolio = (portfolio_id) => {
    const sqlQuery = `DELETE FROM portfolio WHERE portfolio_id = ?`

    return dbPool.execute(sqlQuery, [portfolio_id])
}

module.exports = {
    getAllPortfolio,
    getAllTalentPortfolio,
    getPortfolioDetail,
    getOrCreateIdByName,
    createNewPortfolio,
    uploadPortfolio,
    updatePortfolio,
    deletePortfolio
}