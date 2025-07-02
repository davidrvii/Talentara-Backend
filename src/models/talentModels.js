const dbPool = require('../config/database')
const { uploadPortfolio } = require('../models/portfolioModels')
const {  getOrCreateIdByName } = require('../models/categoriesModels')

//Get All Talent From Database (Testing-Only)
const getAllTalent = () => {
    const sqlQuery = `
        SELECT 
            t.*,
            u.user_name,
            u.user_email,
            u.user_image,
            u.linkedin,
            u.github,
            GROUP_CONCAT(DISTINCT r.role_name SEPARATOR '|') AS roles,
            GROUP_CONCAT(DISTINCT l.language_name SEPARATOR '|') AS languages,
            GROUP_CONCAT(DISTINCT ts.tools_name SEPARATOR '|') AS tools,
            GROUP_CONCAT(DISTINCT pt.product_type_name SEPARATOR '|') AS product_types,
            GROUP_CONCAT(DISTINCT pf.platform_name SEPARATOR '|') AS platforms
        FROM talent t

        LEFT JOIN user u ON u.user_id = t.talent_id

        LEFT JOIN talent_has_role thr ON t.talent_id = thr.talent_id
        LEFT JOIN role r ON thr.role_id = r.role_id

        LEFT JOIN talent_has_language thl ON t.talent_id = thl.talent_id
        LEFT JOIN language l ON thl.language_id = l.language_id

        LEFT JOIN talent_has_tools tht ON t.talent_id = tht.talent_id
        LEFT JOIN tools ts ON tht.tools_id = ts.tools_id

        LEFT JOIN talent_has_product_type thpt ON t.talent_id = thpt.talent_id
        LEFT JOIN product_type pt ON thpt.product_type_id = pt.product_type_id

        LEFT JOIN talent_has_platform thpf ON t.talent_id = thpf.talent_id
        LEFT JOIN platform pf ON thpf.platform_id = pf.platform_id

        GROUP BY t.talent_id
        ORDER BY t.talent_id DESC
    `;

    return dbPool.execute(sqlQuery);
};

const getFilteredTalent = (role_name, excludeIds = []) => {
    // Siapkan bagian excludeIds
    const excludeIdsCondition = excludeIds.length > 0 
        ? `AND t.talent_id NOT IN (${excludeIds.map(() => '?').join(',')})` 
        : '';

    const sqlQuery = `
        SELECT 
            t.*,
            u.user_name,
            u.user_email,
            u.user_image,
            u.linkedin,
            u.github,
            GROUP_CONCAT(DISTINCT r.role_name SEPARATOR '|') AS roles,
            GROUP_CONCAT(DISTINCT l.language_name SEPARATOR '|') AS languages,
            GROUP_CONCAT(DISTINCT ts.tools_name SEPARATOR '|') AS tools,
            GROUP_CONCAT(DISTINCT pt.product_type_name SEPARATOR '|') AS product_types,
            GROUP_CONCAT(DISTINCT pf.platform_name SEPARATOR '|') AS platforms
        FROM talent t

        LEFT JOIN user u ON u.user_id = t.talent_id

        LEFT JOIN talent_has_role thr ON t.talent_id = thr.talent_id
        LEFT JOIN role r ON thr.role_id = r.role_id

        LEFT JOIN talent_has_language thl ON t.talent_id = thl.talent_id
        LEFT JOIN language l ON thl.language_id = l.language_id

        LEFT JOIN talent_has_tools tht ON t.talent_id = tht.talent_id
        LEFT JOIN tools ts ON tht.tools_id = ts.tools_id

        LEFT JOIN talent_has_product_type thpt ON t.talent_id = thpt.talent_id
        LEFT JOIN product_type pt ON thpt.product_type_id = pt.product_type_id

        LEFT JOIN talent_has_platform thpf ON t.talent_id = thpf.talent_id
        LEFT JOIN platform pf ON thpf.platform_id = pf.platform_id

        WHERE 
            u.is_on_project = 0
            AND t.is_on_project = 0
            AND r.role_name = ?
            ${excludeIdsCondition}

        GROUP BY t.talent_id
    `;

    const params = [role_name, ...excludeIds];

    return dbPool.execute(sqlQuery, params);
};


//Get a Talent Detail By ID
const getTalentDetail = (talent_id) => {
    const sqlQuery = `
        SELECT 
            t.*,
            u.user_name,
            u.user_email,
            u.user_image,
            u.linkedin,
            u.github,
            GROUP_CONCAT(DISTINCT r.role_name SEPARATOR '|') AS roles,
            GROUP_CONCAT(DISTINCT l.language_name SEPARATOR '|') AS languages,
            GROUP_CONCAT(DISTINCT ts.tools_name SEPARATOR '|') AS tools,
            GROUP_CONCAT(DISTINCT pt.product_type_name SEPARATOR '|') AS product_types,
            GROUP_CONCAT(DISTINCT pf.platform_name SEPARATOR '|') AS platforms
        FROM talent t

        LEFT JOIN user u ON u.user_id = t.talent_id

        LEFT JOIN talent_has_role thr ON t.talent_id = thr.talent_id
        LEFT JOIN role r ON thr.role_id = r.role_id

        LEFT JOIN talent_has_language thl ON t.talent_id = thl.talent_id
        LEFT JOIN language l ON thl.language_id = l.language_id

        LEFT JOIN talent_has_tools tht ON t.talent_id = tht.talent_id
        LEFT JOIN tools ts ON tht.tools_id = ts.tools_id

        LEFT JOIN talent_has_product_type thpt ON t.talent_id = thpt.talent_id
        LEFT JOIN product_type pt ON thpt.product_type_id = pt.product_type_id

        LEFT JOIN talent_has_platform thpf ON t.talent_id = thpf.talent_id
        LEFT JOIN platform pf ON thpf.platform_id = pf.platform_id

        WHERE t.talent_id = ?
        GROUP BY t.talent_id`;

    return dbPool.execute(sqlQuery, [talent_id]);
};

//Create a New Talent
const createNewTalent = async (body, user_id) => {
    const conn = await dbPool.getConnection()
    await conn.beginTransaction()

    try {
        // Create a New Talent With The Same ID as User ID
        await conn.execute(
            `INSERT INTO talent (talent_id) VALUES (?)`,
            [user_id]
        )

        await conn.execute(
            `UPDATE user SET linkedin = ?, github = ? WHERE user_id = ?`,
            [body.linkedin_profile, body.github_profile, user_id]
        )

        const talent_id = user_id  // PK = user_id

        // Helper insert function
        const insertMany = async (items, tableName, columnName, columnIdName) => {
            for (const itemName of items || []) {
                const id = await getOrCreateIdByName(tableName, columnName, columnIdName, itemName)
                if (id) {
                    await conn.execute(
                        `INSERT INTO talent_has_${tableName} (talent_id, ${columnIdName}) VALUES (?, ?)`,
                        [talent_id, id]
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

        // Insert portfolios
        for (const portfolio of body.portfolio || []) {
            await uploadPortfolio(conn, portfolio, talent_id)
        }

        await conn.commit()
        conn.release()

        return { success: true, message: 'Talent Registered Successfully' }

    } catch (error) {
        await conn.rollback()
        conn.release()
        throw error
    }
}

//Update Talent
const updateTalent = async (body, talent_id) => {
    const conn = await dbPool.getConnection();
    await conn.beginTransaction();

    try {
        const {
            roles,
            languages,
            tools,
            product_types,
            platforms,
            is_project_manager,
            project_done,
            is_on_project,
            availability
        } = body;

        // Update main talent table fields if provided
        const updateTalentFields = [];

        if (typeof is_project_manager !== 'undefined') {
            updateTalentFields.push(`is_project_manager = ${conn.escape(is_project_manager)}`);
        }
        if (typeof project_done !== 'undefined') {
            updateTalentFields.push(`project_done = project_done + ${conn.escape(project_done)}`);
        }
        if (typeof is_on_project !== 'undefined') {
            updateTalentFields.push(`is_on_project = ${conn.escape(is_on_project)}`);
        }
        if (typeof availability !== 'undefined') {
            updateTalentFields.push(`availability = ${conn.escape(availability)}`);
        }

        if (updateTalentFields.length > 0) {
            const updateTalentSql = `
                UPDATE talent
                SET ${updateTalentFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE talent_id = ?
            `;
            await conn.execute(updateTalentSql, [talent_id]);
        }

        // Helper to update many-to-many fields
        const updateMany = async (items, tableName, columnName, columnIdName) => {
            await conn.execute(`DELETE FROM talent_has_${tableName} WHERE talent_id = ?`, [talent_id]);
            for (const itemName of items || []) {
                const id = await getOrCreateIdByName(tableName, columnName, columnIdName, itemName);
                if (id) {
                    await conn.execute(
                        `INSERT INTO talent_has_${tableName} (talent_id, ${columnIdName}) VALUES (?, ?)`,
                        [talent_id, id]
                    );
                }
            }
        };

        // Update roles
        if (Array.isArray(roles)) {
            await updateMany(roles, 'role', 'role_name', 'role_id');
        }

        // Update languages
        if (Array.isArray(languages)) {
            await updateMany(languages, 'language', 'language_name', 'language_id');
        }

        // Update tools
        if (Array.isArray(tools)) {
            await updateMany(tools, 'tools', 'tools_name', 'tools_id');
        }

        // Update product types
        if (Array.isArray(product_types)) {
            await updateMany(product_types, 'product_type', 'product_type_name', 'product_type_id');
        }

        // Update platforms
        if (Array.isArray(platforms)) {
            await updateMany(platforms, 'platform', 'platform_name', 'platform_id');
        }

        await conn.commit();
        conn.release();

        return { success: true, message: 'Talent updated successfully' };

    } catch (err) {
        await conn.rollback();
        conn.release();
        throw err;
    }
}


const updateTalentDeclineCount = async (talent_id) => {
    const sqlQuery = `
        UPDATE talent
        SET project_declined = project_declined + 1
        WHERE talent_id = ?`
    return dbPool.execute(sqlQuery, [talent_id]);
}

//Delete a Talent By ID (Testing-Only)
const deleteTalent = (talent_id) => {
    const sqlQuery = `DELETE FROM talent WHERE talent_id = ?`

    return dbPool.execute(sqlQuery, [talent_id])
}

module.exports = {
    getAllTalent,
    getFilteredTalent,
    getTalentDetail,
    createNewTalent,
    updateTalent,
    updateTalentDeclineCount,
    deleteTalent
}