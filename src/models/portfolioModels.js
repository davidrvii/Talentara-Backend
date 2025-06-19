const dbPool = require('../config/database')

//Get All Portfolio From Database (Testing-Only)
const getAllPortfolio = () => {
    const sqlQuery = `
        SELECT 
            p.*,
            GROUP_CONCAT(DISTINCT r.role_name SEPARATOR '|') AS roles,
            GROUP_CONCAT(DISTINCT t.tools_name SEPARATOR '|') AS tools,
            GROUP_CONCAT(DISTINCT l.language_name SEPARATOR '|') AS languages,
            GROUP_CONCAT(DISTINCT pt.product_type_name SEPARATOR '|') AS product_types,
            GROUP_CONCAT(DISTINCT pf.platform_name SEPARATOR '|') AS platforms,
            GROUP_CONCAT(DISTINCT f.feature_name SEPARATOR '|') AS features
        FROM portfolio p

        LEFT JOIN portfolio_has_role pr ON p.portfolio_id = pr.portfolio_id
        LEFT JOIN role r ON pr.role_id = r.role_id

        LEFT JOIN portfolio_has_tools pht ON p.portfolio_id = pht.portfolio_id
        LEFT JOIN tools t ON pht.tools_id = t.tools_id

        LEFT JOIN portfolio_has_language pl ON p.portfolio_id = pl.portfolio_id
        LEFT JOIN language l ON pl.language_id = l.language_id

        LEFT JOIN portfolio_has_product_type ppt ON p.portfolio_id = ppt.portfolio_id
        LEFT JOIN product_type pt ON ppt.product_type_id = pt.product_type_id

        LEFT JOIN portfolio_has_platform pp ON p.portfolio_id = pp.portfolio_id
        LEFT JOIN platform pf ON pp.platform_id = pf.platform_id

        LEFT JOIN portfolio_has_feature phf ON p.portfolio_id = phf.portfolio_id
        LEFT JOIN feature f ON phf.feature_id = f.feature_id

        GROUP BY p.portfolio_id
        ORDER BY p.portfolio_id DESC`
    
    return dbPool.execute(sqlQuery)
}

//Get All Portfolio By Specific Talent
const getAllTalentPortfolio = (talent_id) => {
    const sqlQuery =   `
        SELECT 
            p.*,
            GROUP_CONCAT(DISTINCT r.role_name SEPARATOR '|') AS roles,
            GROUP_CONCAT(DISTINCT t.tools_name SEPARATOR '|') AS tools,
            GROUP_CONCAT(DISTINCT l.language_name SEPARATOR '|') AS languages,
            GROUP_CONCAT(DISTINCT pt.product_type_name SEPARATOR '|') AS product_types,
            GROUP_CONCAT(DISTINCT pf.platform_name SEPARATOR '|') AS platforms,
            GROUP_CONCAT(DISTINCT f.feature_name SEPARATOR '|') AS features
        FROM portfolio p

        LEFT JOIN portfolio_has_role pr ON p.portfolio_id = pr.portfolio_id
        LEFT JOIN role r ON pr.role_id = r.role_id

        LEFT JOIN portfolio_has_tools pht ON p.portfolio_id = pht.portfolio_id
        LEFT JOIN tools t ON pht.tools_id = t.tools_id

        LEFT JOIN portfolio_has_language pl ON p.portfolio_id = pl.portfolio_id
        LEFT JOIN language l ON pl.language_id = l.language_id

        LEFT JOIN portfolio_has_product_type ppt ON p.portfolio_id = ppt.portfolio_id
        LEFT JOIN product_type pt ON ppt.product_type_id = pt.product_type_id

        LEFT JOIN portfolio_has_platform pp ON p.portfolio_id = pp.portfolio_id
        LEFT JOIN platform pf ON pp.platform_id = pf.platform_id

        LEFT JOIN portfolio_has_feature phf ON p.portfolio_id = phf.portfolio_id
        LEFT JOIN feature f ON phf.feature_id = f.feature_id

        WHERE talent_id = ?
        GROUP BY p.portfolio_id`

    return dbPool.execute(sqlQuery, [talent_id])
}

//Get a Portfolio Detail By ID
const getPortfolioDetail = (portfolio_id) => {
    const sqlQuery =   `
        SELECT 
            p.*,
            GROUP_CONCAT(DISTINCT r.role_name SEPARATOR '|') AS roles,
            GROUP_CONCAT(DISTINCT t.tools_name SEPARATOR '|') AS tools,
            GROUP_CONCAT(DISTINCT l.language_name SEPARATOR '|') AS languages,
            GROUP_CONCAT(DISTINCT pt.product_type_name SEPARATOR '|') AS product_types,
            GROUP_CONCAT(DISTINCT pf.platform_name SEPARATOR '|') AS platforms,
            GROUP_CONCAT(DISTINCT f.feature_name SEPARATOR '|') AS features
        FROM portfolio p
        LEFT JOIN portfolio_has_role pr ON p.portfolio_id = pr.portfolio_id
        LEFT JOIN role r ON pr.role_id = r.role_id

        LEFT JOIN portfolio_has_tools pht ON p.portfolio_id = pht.portfolio_id
        LEFT JOIN tools t ON pht.tools_id = t.tools_id

        LEFT JOIN portfolio_has_language pl ON p.portfolio_id = pl.portfolio_id
        LEFT JOIN language l ON pl.language_id = l.language_id

        LEFT JOIN portfolio_has_product_type ppt ON p.portfolio_id = ppt.portfolio_id
        LEFT JOIN product_type pt ON ppt.product_type_id = pt.product_type_id

        LEFT JOIN portfolio_has_platform pp ON p.portfolio_id = pp.portfolio_id
        LEFT JOIN platform pf ON pp.platform_id = pf.platform_id

        LEFT JOIN portfolio_has_feature phf ON p.portfolio_id = phf.portfolio_id
        LEFT JOIN feature f ON phf.feature_id = f.feature_id

        WHERE p.portfolio_id = ?
        GROUP BY p.portfolio_id`

    return dbPool.execute(sqlQuery, [portfolio_id])
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

//Talent Input a Portfolio
const createNewPortfolio = async (body, talent_id) => {
    const conn = await dbPool.getConnection()
        await conn.beginTransaction() //Start SQL transaction

    try {
        const portfolio_id = await uploadPortfolio(conn, body, talent_id)

        await conn.commit() //Commit if everything succeeds
        conn.release() 

        return {newPortfolioID: portfolio_id}

    } catch (error) {
        await conn.rollback() //Rollback on failure
        conn.release() 
        throw error;
    }
}

//Create a New Portfolio
const uploadPortfolio = async (conn, body, talent_id) => {
    const [portfolioRes] = await conn.execute(
        `INSERT INTO portfolio (talent_id, portfolio_name, portfolio_linkedin, portfolio_github, portfolio_desc, portfolio_label, start_date, end_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            talent_id,
            body.portfolio_name,
            body.portfolio_linkedin,
            body.portfolio_github,
            body.portfolio_desc,
            body.portfolio_label,
            body.start_date,
            body.end_date
        ]
    )
    const portfolio_id = portfolioRes.insertId

    // Helper insert function
    const insertMany = async (items, tableName, columnName, columnIdName) => {
        for (const itemName of items || []) {
            const id = await getOrCreateIdByName(tableName, columnName, columnIdName, itemName)
            if (id) {
                await conn.execute(
                    `INSERT INTO portfolio_has_${tableName} (portfolio_id, ${columnIdName}) VALUES (?, ?)`,
                    [portfolio_id, id]
                )
            }
        }
    }

    // Insert roles
        await insertMany(body.roles, 'role', 'role_name', 'role_id')

        // Insert tools
        await insertMany(body.tools, 'tools', 'tools_name', 'tools_id')

        // Insert platforms
        await insertMany(body.platforms, 'platform', 'platform_name', 'platform_id')

        // Insert product types
        await insertMany(body.product_types, 'product_type', 'product_type_name', 'product_type_id')

        // Insert languages
        await insertMany(body.languages, 'language', 'language_name', 'language_id')

    return portfolio_id
}


//Update a Portfolio By ID (Testing-Only)
const updatePortfolio = async (body, portfolio_id) => {
    const conn = await dbPool.getConnection()
    await conn.beginTransaction()

    try {
        const {
            portfolio_name,
            portfolio_linkedin,
            portfolio_source,
            portfolio_desc,
            tools,
            languages,
            product_types,
            platforms,
            roles,
            features
        } = body


        //Custom Query Following By User Input
        // Update main portfolio fields if provided
        if (portfolio_name || portfolio_linkedin || portfolio_source || portfolio_desc) {
            const updateFields = []
            const updateValues = []

            if (portfolio_name) {
                updateFields.push('portfolio_name = ?')
                updateValues.push(portfolio_name)
            }
            if (portfolio_linkedin) {
                updateFields.push('portfolio_linkedin = ?')
                updateValues.push(portfolio_linkedin)
            }
            if (portfolio_source) {
                updateFields.push('portfolio_source = ?')
                updateValues.push(portfolio_source)
            }
            if (portfolio_desc) {
                updateFields.push('portfolio_desc = ?')
                updateValues.push(portfolio_desc)
            }

            updateValues.push(portfolio_id)
            const sqlQuery = `UPDATE portfolio SET ${updateFields.join(', ')} WHERE portfolio_id = ?`
            await conn.execute(sqlQuery, updateValues)
        }

        // Update tools
        if (Array.isArray(tools)) {
            await conn.execute(`DELETE FROM portfolio_has_tools WHERE portfolio_id = ?`, [portfolio_id])
            for (const toolName of tools) {
                const tool_id = await getOrCreateIdByName('tools', 'tools_name', 'tools_id', toolName)
                if (tool_id) {
                    await conn.execute(`INSERT INTO portfolio_has_tools (portfolio_id, tools_id) VALUES (?, ?)`, [portfolio_id, tool_id])
                }
            }
        }

        // Update languages
        if (Array.isArray(languages)) {
            await conn.execute(`DELETE FROM portfolio_has_language WHERE portfolio_id = ?`, [portfolio_id])
            for (const langName of languages) {
                const lang_id = await getOrCreateIdByName('language', 'language_name', 'language_id', langName)
                if (lang_id) {
                    await conn.execute(`INSERT INTO portfolio_has_language (portfolio_id, language_id) VALUES (?, ?)`, [portfolio_id, lang_id])
                }
            }
        }

        // Update product types
        if (Array.isArray(product_types)) {
            await conn.execute(`DELETE FROM portfolio_has_product_type WHERE portfolio_id = ?`, [portfolio_id])
            for (const typeName of product_types) {
                const type_id = await getOrCreateIdByName('product_type', 'product_type_name', 'product_type_id', typeName)
                if (type_id) {
                    await conn.execute(`INSERT INTO portfolio_has_product_type (portfolio_id, product_type_id) VALUES (?, ?)`, [portfolio_id, type_id])
                }
            }
        }

        // Update platforms
        if (Array.isArray(platforms)) {
            await conn.execute(`DELETE FROM portfolio_has_platform WHERE portfolio_id = ?`, [portfolio_id])
            for (const platformName of platforms) {
                const platform_id = await getOrCreateIdByName('platform', 'platform_name', 'platform_id', platformName)
                if (platform_id) {
                    await conn.execute(`INSERT INTO portfolio_has_platform (portfolio_id, platform_id) VALUES (?, ?)`, [portfolio_id, platform_id])
                }
            }
        }

        // Update features
        if (Array.isArray(features)) {
            await conn.execute(`DELETE FROM portfolio_has_feature WHERE portfolio_id = ?`, [portfolio_id])
            for (const featureName of features) {
                const feature_id = await getOrCreateIdByName('feature', 'feature_name', 'feature_id', featureName)
                if (feature_id) {
                    await conn.execute(`INSERT INTO portfolio_has_feature (portfolio_id, feature_id) VALUES (?, ?)`, [portfolio_id, feature_id])
                }
            }
        }

        // Update roles
        if (Array.isArray(roles)) {
            await conn.execute(`DELETE FROM portfolio_has_role WHERE portfolio_id = ?`, [portfolio_id])
            for (const roleName of roles) {
                const role_id = await getOrCreateIdByName('role', 'role_name', 'role_id', roleName)
                if (role_id) {
                    await conn.execute(`INSERT INTO portfolio_has_role (portfolio_id, role_id) VALUES (?, ?)`, [portfolio_id, role_id])
                }
            }
        }

        await conn.commit()
        conn.release()
        return { success: true, message: 'Portfolio updated successfully' }

    } catch (err) {
        await conn.rollback()
        conn.release()
        throw err
    }
}

//Delete a Portfolio By ID (Testing-Only)
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