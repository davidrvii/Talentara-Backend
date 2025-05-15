const dbPool = require('../config/database')
const { uploadPortfolio, getOrCreateIdByName } = require('../models/portfolioModels')

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
    `;

    return dbPool.execute(sqlQuery);
};

//Get a Talent Detail By ID
const getTalentDetail = (talent_id) => {
    const sqlQuery = `
        SELECT 
            t.talent_id,
            t.talent_avg_rating,
            t.project_done,
            t.is_project_manager,
            t.availability,
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
        //Create a New Talent With The Same ID as User ID
        const [talentRes] = await conn.execute(
            `INSERT INTO talent (talent_id) VALUES (?)`,
            [user_id]
        ) 
        //Get a New Talent ID
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

        //Create Inputed Talent's Portfolios 
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

//Update a Talent By ID
const updateTalent = async (body, talent_id) => {
    const conn = await dbPool.getConnection();
    await conn.beginTransaction();

    try {
        const {
            roles,
            languages,
            tools,
            product_types,
            platforms
        } = body;

        // Update roles if provided
        if (Array.isArray(roles)) {
            await conn.execute(`DELETE FROM talent_has_role WHERE talent_id = ?`, [talent_id]);
            for (const roleName of roles) {
                const role_id = await getOrCreateIdByName('role', 'role_name', 'role_id', roleName);
                if (role_id) {
                    await conn.execute(
                        `INSERT INTO talent_has_role (talent_id, role_id) VALUES (?, ?)`,
                        [talent_id, role_id]
                    );
                }
            }
        }

        // Update languages if provided
        if (Array.isArray(languages)) {
            await conn.execute(`DELETE FROM talent_has_language WHERE talent_id = ?`, [talent_id]);
            for (const languageName of languages) {
                const language_id = await getOrCreateIdByName('language', 'language_name', 'language_id', languageName);
                if (language_id) {
                    await conn.execute(
                        `INSERT INTO talent_has_language (talent_id, language_id) VALUES (?, ?)`,
                        [talent_id, language_id]
                    );
                }
            }
        }

        // Update tools if provided
        if (Array.isArray(tools)) {
            await conn.execute(`DELETE FROM talent_has_tools WHERE talent_id = ?`, [talent_id]);
            for (const toolName of tools) {
                const tool_id = await getOrCreateIdByName('tools', 'tools_name', 'tools_id', toolName);
                if (tool_id) {
                    await conn.execute(
                        `INSERT INTO talent_has_tools (talent_id, tools_id) VALUES (?, ?)`,
                        [talent_id, tool_id]
                    );
                }
            }
        }

        // Update product types if provided
        if (Array.isArray(product_types)) {
            await conn.execute(`DELETE FROM talent_has_product_type WHERE talent_id = ?`, [talent_id]);
            for (const typeName of product_types) {
                const type_id = await getOrCreateIdByName('product_type', 'product_type_name', 'product_type_id', typeName);
                if (type_id) {
                    await conn.execute(
                        `INSERT INTO talent_has_product_type (talent_id, product_type_id) VALUES (?, ?)`,
                        [talent_id, type_id]
                    );
                }
            }
        }

        // Update platforms if provided
        if (Array.isArray(platforms)) {
            await conn.execute(`DELETE FROM talent_has_platform WHERE talent_id = ?`, [talent_id]);
            for (const platformName of platforms) {
                const platform_id = await getOrCreateIdByName('platform', 'platform_name', 'platform_id', platformName);
                if (platform_id) {
                    await conn.execute(
                        `INSERT INTO talent_has_platform (talent_id, platform_id) VALUES (?, ?)`,
                        [talent_id, platform_id]
                    );
                }
            }
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
    getTalentDetail,
    createNewTalent,
    updateTalent,
    updateTalentDeclineCount,
    deleteTalent
}