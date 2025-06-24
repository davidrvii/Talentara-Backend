const dbPool = require('../config/database')
const categoriesModel = require('../models/categoriesModels')

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
        `INSERT INTO portfolio (talent_id, client_name, portfolio_name, portfolio_linkedin, portfolio_github, portfolio_desc, portfolio_label, start_date, end_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            talent_id,
            body.client_name,
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
            const id = await categoriesModel.getOrCreateIdByName(tableName, columnName, columnIdName, itemName)
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

        const updateMany = async (items, tableName, columnName, columnIdName) => {
            await conn.execute(`DELETE FROM portfolio_has_${tableName} WHERE portfolio_id = ?`, [portfolio_id])
            for (const itemName of items || []) {
                const id = await categoriesModel.getOrCreateIdByName(tableName, columnName, columnIdName, itemName)
                if (id) {
                    await conn.execute(
                        `INSERT INTO portfolio_has_${tableName} (portfolio_id, ${columnIdName}) VALUES (?, ?)`,
                        [portfolio_id, id]
                    )
                }
            }
        }

        if (Array.isArray(tools)) {
            await updateMany(tools, 'tools', 'tools_name', 'tools_id')
        }

        if (Array.isArray(languages)) {
            await updateMany(languages, 'language', 'language_name', 'language_id')
        }

        if (Array.isArray(product_types)) {
            await updateMany(product_types, 'product_type', 'product_type_name', 'product_type_id')
        }

        if (Array.isArray(platforms)) {
            await updateMany(platforms, 'platform', 'platform_name', 'platform_id')
        }

        if (Array.isArray(features)) {
            await updateMany(features, 'feature', 'feature_name', 'feature_id')
        }

        if (Array.isArray(roles)) {
            await updateMany(roles, 'role', 'role_name', 'role_id')
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
    createNewPortfolio,
    uploadPortfolio,
    updatePortfolio,
    deletePortfolio
}