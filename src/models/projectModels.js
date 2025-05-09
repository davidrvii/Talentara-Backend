const dbPool = require('../config/database')

const getAllProject = () => {
    const sqlQuery = `SELECT * FROM project`
    
    return dbPool.execute(sqlQuery)
}

const getAllProjectHistory = (talent_id) => {
    const sqlQuery =   `SELECT * FROM project
                        WHERE talent_id = ?`

    return dbPool.execute(sqlQuery, [talent_id])
}

const getProjectOrder = () => {

}

const getProjectDetail = (project_id) => {
    const sqlQuery =   `SELECT * FROM project
                        WHERE project_id = ?`

    return dbPool.execute(sqlQuery, [project_id])
}

const createNewProject = () => {

}

const updateProject = (body, project_id) => {
    const keys = Object.keys(body);
        const values = Object.values(body);
            
        const fields = keys.map(key => `${key} = ?`).join(', ')
        const sqlQuery = `UPDATE project SET ${fields} WHERE project_id = ?`
            
        return dbPool.execute(sqlQuery, [...values, project_id])
}

const deleteProject = (project_id) => {
    const sqlQuery =   `DELETE FROM project
                        WHERE project_id = ?`

    return dbPool.execute(sqlQuery)
}

module.exports = {
    getAllProject,
    getAllProjectHistory,
    getLeaderProject,
    getTeamProject,
    getProjectDetail,
    createNewProject,
    updateProject,
    deleteProject
}