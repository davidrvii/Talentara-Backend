const dbPool = require('../config/database')
const {  getOrCreateIdByName } = require('../models/portfolioModels')

// Get All Project From Database (Testing-Only)
const getAllProject = () => {
    const sqlQuery = `
        SELECT 
            p.*,
            GROUP_CONCAT(DISTINCT CONCAT(u.user_name, ' (', r.role_name, ')') SEPARATOR '|') AS talents,
            GROUP_CONCAT(DISTINCT t.tools_name SEPARATOR '|') AS tools,
            GROUP_CONCAT(DISTINCT l.language_name SEPARATOR '|') AS languages,
            GROUP_CONCAT(DISTINCT pt.product_type_name SEPARATOR '|') AS product_types,
            GROUP_CONCAT(DISTINCT pf.platform_name SEPARATOR '|') AS platforms,
            GROUP_CONCAT(DISTINCT f.feature_name SEPARATOR '|') AS features
        FROM project p

        LEFT JOIN project_has_talent pht ON p.project_id = pht.project_id
        LEFT JOIN talent tlt ON pht.talent_id = tlt.talent_id
        LEFT JOIN user u ON tlt.talent_id = u.user_id

        LEFT JOIN role r ON pht.role_id = r.role_id

        LEFT JOIN project_has_tools pht2 ON p.project_id = pht2.project_id
        LEFT JOIN tools t ON pht2.tools_id = t.tools_id

        LEFT JOIN project_has_language pl ON p.project_id = pl.project_id
        LEFT JOIN language l ON pl.language_id = l.language_id

        LEFT JOIN project_has_product_type ppt ON p.project_id = ppt.project_id
        LEFT JOIN product_type pt ON ppt.product_type_id = pt.product_type_id

        LEFT JOIN project_has_platform pp ON p.project_id = pp.project_id
        LEFT JOIN platform pf ON pp.platform_id = pf.platform_id

        LEFT JOIN project_has_feature phf ON p.project_id = phf.project_id
        LEFT JOIN feature f ON phf.feature_id = f.feature_id

        GROUP BY p.project_id
        ORDER BY p.project_id DESC`
    
    return dbPool.execute(sqlQuery)
}

// Get All Projects History By Specific Talent
const getAllProjectHistory = (talent_id) => {
    const sqlQuery = `
        SELECT 
            p.*,
            GROUP_CONCAT(DISTINCT CONCAT(u.user_name, ' (', r.role_name, ')') SEPARATOR '|') AS talents,
            GROUP_CONCAT(DISTINCT t.tools_name SEPARATOR '|') AS tools,
            GROUP_CONCAT(DISTINCT l.language_name SEPARATOR '|') AS languages,
            GROUP_CONCAT(DISTINCT pt.product_type_name SEPARATOR '|') AS product_types,
            GROUP_CONCAT(DISTINCT pf.platform_name SEPARATOR '|') AS platforms,
            GROUP_CONCAT(DISTINCT f.feature_name SEPARATOR '|') AS features
        FROM project p

        LEFT JOIN project_has_talent pht ON p.project_id = pht.project_id
        LEFT JOIN talent tlt ON pht.talent_id = tlt.talent_id
        LEFT JOIN user u ON tlt.talent_id = u.user_id

        LEFT JOIN role r ON pht.role_id = r.role_id

        LEFT JOIN project_has_tools pht2 ON p.project_id = pht2.project_id
        LEFT JOIN tools t ON pht2.tools_id = t.tools_id

        LEFT JOIN project_has_language pl ON p.project_id = pl.project_id
        LEFT JOIN language l ON pl.language_id = l.language_id

        LEFT JOIN project_has_product_type ppt ON p.project_id = ppt.project_id
        LEFT JOIN product_type pt ON ppt.product_type_id = pt.product_type_id

        LEFT JOIN project_has_platform pp ON p.project_id = pp.project_id
        LEFT JOIN platform pf ON pp.platform_id = pf.platform_id

        LEFT JOIN project_has_feature phf ON p.project_id = phf.project_id
        LEFT JOIN feature f ON phf.feature_id = f.feature_id

        WHERE p.project_id IN (
            SELECT project_id FROM project_has_talent WHERE talent_id = ?
        )
        GROUP BY p.project_id`

    return dbPool.execute(sqlQuery, [talent_id])
}

// Get a Project Detail By Project ID
const getProjectDetail = (project_id) => {
    const sqlQuery = `
        SELECT 
            p.*,
            GROUP_CONCAT(DISTINCT CONCAT(u.user_name, ' (', r.role_name, ')') SEPARATOR '|') AS talents,
            GROUP_CONCAT(DISTINCT t.tools_name SEPARATOR '|') AS tools,
            GROUP_CONCAT(DISTINCT l.language_name SEPARATOR '|') AS languages,
            GROUP_CONCAT(DISTINCT pt.product_type_name SEPARATOR '|') AS product_types,
            GROUP_CONCAT(DISTINCT pf.platform_name SEPARATOR '|') AS platforms,
            GROUP_CONCAT(DISTINCT f.feature_name SEPARATOR '|') AS features
        FROM project p

        LEFT JOIN project_has_talent pht ON p.project_id = pht.project_id
        LEFT JOIN talent tlt ON pht.talent_id = tlt.talent_id
        LEFT JOIN user u ON tlt.talent_id = u.user_id

        LEFT JOIN role r ON pht.role_id = r.role_id

        LEFT JOIN project_has_tools pht2 ON p.project_id = pht2.project_id
        LEFT JOIN tools t ON pht2.tools_id = t.tools_id

        LEFT JOIN project_has_language pl ON p.project_id = pl.project_id
        LEFT JOIN language l ON pl.language_id = l.language_id

        LEFT JOIN project_has_product_type ppt ON p.project_id = ppt.project_id
        LEFT JOIN product_type pt ON ppt.product_type_id = pt.product_type_id

        LEFT JOIN project_has_platform pp ON p.project_id = pp.project_id
        LEFT JOIN platform pf ON pp.platform_id = pf.platform_id

        LEFT JOIN project_has_feature phf ON p.project_id = phf.project_id
        LEFT JOIN feature f ON phf.feature_id = f.feature_id

        WHERE p.project_id = ?
        GROUP BY p.project_id`

    return dbPool.execute(sqlQuery, [project_id])
}

//Get an Ordered Project to Send to Chosen Talent
const getProjectOrder = (project_id) => {
    const sqlQuery = `
        SELECT 
            p.*,
            GROUP_CONCAT(DISTINCT CONCAT(r.role_name, ' (', phr.role_amount, ')') SEPARATOR '|') AS roles,
            GROUP_CONCAT(DISTINCT t.tools_name SEPARATOR '|') AS tools,
            GROUP_CONCAT(DISTINCT l.language_name SEPARATOR '|') AS languages,
            GROUP_CONCAT(DISTINCT pt.product_type_name SEPARATOR '|') AS product_types,
            GROUP_CONCAT(DISTINCT pf.platform_name SEPARATOR '|') AS platforms,
            GROUP_CONCAT(DISTINCT f.feature_name SEPARATOR '|') AS features
        FROM project p

        LEFT JOIN project_has_role phr ON p.project_id = phr.project_id
        LEFT JOIN role r ON phr.role_id = r.role_id

        LEFT JOIN project_has_tools pht ON p.project_id = pht.project_id
        LEFT JOIN tools t ON pht.tools_id = t.tools_id

        LEFT JOIN project_has_language pl ON p.project_id = pl.project_id
        LEFT JOIN language l ON pl.language_id = l.language_id

        LEFT JOIN project_has_product_type ppt ON p.project_id = ppt.project_id
        LEFT JOIN product_type pt ON ppt.product_type_id = pt.product_type_id

        LEFT JOIN project_has_platform pp ON p.project_id = pp.project_id
        LEFT JOIN platform pf ON pp.platform_id = pf.platform_id

        LEFT JOIN project_has_feature phf ON p.project_id = phf.project_id
        LEFT JOIN feature f ON phf.feature_id = f.feature_id

        WHERE p.project_id = ?
        GROUP BY p.project_id
    `;

    return dbPool.execute(sqlQuery, [project_id]);
}

const getCurrentProject = (user_id) => {
    const sqlQuery = `
        SELECT 
            p.project_id,
            p.project_name,
            p.client_name,
            p.end_date,
            s.status_name,
            GROUP_CONCAT(DISTINCT pt.product_type_name SEPARATOR '|') AS product_types,
            GROUP_CONCAT(DISTINCT pf.platform_name SEPARATOR '|') AS platforms
        FROM project p
        JOIN status s ON p.status_id = s.status_id
        LEFT JOIN project_has_product_type ppt ON p.project_id = ppt.project_id
        LEFT JOIN product_type pt ON ppt.product_type_id = pt.product_type_id
        LEFT JOIN project_has_platform pp ON p.project_id = pp.project_id
        LEFT JOIN platform pf ON pp.platform_id = pf.platform_id
        WHERE p.user_id = ?
        AND p.status_id IN (1, 2, 3)
        GROUP BY p.project_id
        ORDER BY p.start_date ASC
        LIMIT 1
    `

    return dbPool.execute(sqlQuery, [user_id])
}



const createNewProject = async (body, user_id) => {
    const conn = await dbPool.getConnection();
    await conn.beginTransaction();

    try {
        const {
            status_id,
            client_name,
            project_name,
            project_desc,
            start_date,
            end_date,
            tools = [],
            languages = [],
            product_types = [],
            platforms = [],
            features = [],
            roles = []
        } = body;

        // Insert project
        const [projectRes] = await conn.execute(
            `INSERT INTO project (user_id, status_id, client_name, project_name, project_desc, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user_id, status_id, client_name, project_name, project_desc, start_date, end_date]
        );

        const project_id = projectRes.insertId;

        // Insert roles
        for (const { role_name, amount } of roles) {
            const role_id = await getOrCreateIdByName('role', 'role_name', 'role_id', role_name);
            if (role_id) {
                await conn.execute(
                    `INSERT INTO project_has_role (project_id, role_id, role_amount) VALUES (?, ?, ?)`,
                    [project_id, role_id, amount]
                );
            }
        }

        // Helper insertMany
        const insertMany = async (items, tableName, columnName, columnIdName) => {
            for (const itemName of items) {
                const id = await getOrCreateIdByName(tableName, columnName, columnIdName, itemName);
                if (id) {
                    await conn.execute(
                        `INSERT INTO project_has_${tableName} (project_id, ${columnIdName}) VALUES (?, ?)`,
                        [project_id, id]
                    );
                }
            }
        };

        await insertMany(tools, 'tools', 'tools_name', 'tools_id');
        await insertMany(languages, 'language', 'language_name', 'language_id');
        await insertMany(product_types, 'product_type', 'product_type_name', 'product_type_id');
        await insertMany(platforms, 'platform', 'platform_name', 'platform_id');
        await insertMany(features, 'feature', 'feature_name', 'feature_id');

        await conn.commit();
        conn.release();

        return { success: true, project_id };

    } catch (err) {
        await conn.rollback();
        conn.release();
        throw err;
    }
};

//Insert Talent Who Accept The Project
const insertToProjectHasTalent = async (project_id, talent_id, role_name) => {
    const conn = await dbPool.getConnection()
    await conn.beginTransaction()

    try {
        const role_id = await getOrCreateIdByName('role', 'role_name', 'role_id', role_name)
        if (role_id) {
            await conn.execute(
                `INSERT INTO project_has_talent (project_id, talent_id, role_id) VALUES (?, ?, ?)`,
                [project_id, talent_id, role_id]
            )
        }

        await conn.commit()
        conn.release()

    } catch (err) {
        await conn.rollback()
        conn.release()
        throw err
    }
}


const updateProject = async (body, project_id) => {
    const conn = await dbPool.getConnection();
    await conn.beginTransaction();

    try {
        const {
            project_name,
            project_desc,
            project_github,
            meet_link,
            start_date,
            end_date,
            user_target,
            tools,
            languages,
            product_types,
            platforms,
            features,
            roles
        } = body

        // Update main project fields
        const updateFields = []
        const updateValues = []

        if (project_name) {
            updateFields.push('project_name = ?')
            updateValues.push(project_name)
        }
        if (project_desc) {
            updateFields.push('project_desc = ?')
            updateValues.push(project_desc)
        }
        if (project_github) {
            updateFields.push('project_github = ?')
            updateValues.push(project_github)
        }
        if (meet_link) {
            updateFields.push('meet_link = ?')
            updateValues.push(meet_link)
        }
        if (start_date) {
            updateFields.push('start_date = ?')
            updateValues.push(start_date)
        }
        if (end_date) {
            updateFields.push('end_date = ?')
            updateValues.push(end_date)
        }
        if (user_target) {
            updateFields.push('user_target = ?')
            updateValues.push(user_target)
        }
        if (updateFields.length > 0) {
            updateValues.push(project_id)
            const sqlQuery = `UPDATE project SET ${updateFields.join(', ')} WHERE project_id = ?`
            await conn.execute(sqlQuery, updateValues)
        }

        // Helper function for many-to-many tables
        const updateMany = async (items, tableName, nameCol, idCol) => {
            await conn.execute(`DELETE FROM project_has_${tableName} WHERE project_id = ?`, [project_id])
            for (const itemName of items || []) {
                const id = await getOrCreateIdByName(tableName, nameCol, idCol, itemName)
                if (id) {
                    await conn.execute(
                        `INSERT INTO project_has_${tableName} (project_id, ${idCol}) VALUES (?, ?)`,
                        [project_id, id]
                    );
                }
            }
        };

        // Update tools
        if (Array.isArray(tools)) {
            await updateMany(tools, 'tools', 'tools_name', 'tools_id')
        }

        // Update languages
        if (Array.isArray(languages)) {
            await updateMany(languages, 'language', 'language_name', 'language_id')
        }

        // Update product types
        if (Array.isArray(product_types)) {
            await updateMany(product_types, 'product_type', 'product_type_name', 'product_type_id')
        }

        // Update platforms
        if (Array.isArray(platforms)) {
            await updateMany(platforms, 'platform', 'platform_name', 'platform_id')
        }

        // Update features
        if (Array.isArray(features)) {
            await updateMany(features, 'feature', 'feature_name', 'feature_id')
        }

        // Update roles
        if (Array.isArray(roles)) {
            await conn.execute(`DELETE FROM project_has_role WHERE project_id = ?`, [project_id])
            for (const { role_name, amount } of roles || []) {
                const role_id = await getOrCreateIdByName('role', 'role_name', 'role_id', role_name)
                if (role_id) {
                    await conn.execute(
                        `INSERT INTO project_has_role (project_id, role_id, role_amount) VALUES (?, ?, ?)`,
                        [project_id, role_id, amount]
                    )
                }
            }
        }

        await conn.commit()
        conn.release()
        return { success: true, message: 'Project updated successfully' }

    } catch (err) {
        await conn.rollback()
        conn.release()
        throw err
    }
}


//Delete a Project By ID (Testing-Only)
const deleteProject = (project_id) => {
    const sqlQuery =   `DELETE FROM project
                        WHERE project_id = ?`

    return dbPool.execute(sqlQuery, [project_id])
}

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

const getAllFeatures = () => {
    const sqlQuery = `SELECT feature_name FROM feature`

    return dbPool.execute(sqlQuery)
}

const getProjectRoleRequirement = (project_id) => {
    const sqlQuery =   `
        SELECT 
            phr.role_id,
            r.role_name,
            phr.role_amount
        FROM project_has_role AS phr
        JOIN role AS r
            ON phr.role_id = r.role_id
        WHERE phr.project_id = ?`
                    
    return dbPool.execute(sqlQuery, [project_id])
}

const countAcceptedTalentsByRole = (project_id) => {
    const sqlQuery =   `
        SELECT
            phr.role_id,
            r.role_name,
            COUNT(pht.talent_id) AS accepted_count
        FROM project_has_role AS phr
        LEFT JOIN project_has_talent AS pht
            ON phr.project_id = pht.project_id
            AND phr.role_id = pht.role_id
        JOIN role AS r
            ON phr.role_id = r.role_id
        WHERE phr.project_id = ?
        GROUP BY phr.role_id, r.role_name`

    return dbPool.execute(sqlQuery, [project_id])
}

const updateProjectStatus = (project_id, status_id) => {
    const sqlQuery = `UPDATE project SET status_id = ? WHERE project_id = ?`

    return dbPool.execute(sqlQuery, [project_id, status_id])
}

module.exports = {
    getAllProject,
    getAllProjectHistory,
    getProjectDetail,
    getProjectOrder,
    getCurrentProject,
    createNewProject,
    insertToProjectHasTalent,
    updateProject,
    deleteProject,
    getAllPlatform,
    getAllProductType,
    getAllRole,
    getAllLanguage,
    getAllTools,
    getAllFeatures,
    getProjectRoleRequirement,
    countAcceptedTalentsByRole,
    updateProjectStatus
}