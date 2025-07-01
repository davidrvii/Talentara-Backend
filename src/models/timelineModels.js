const dbPool = require('../config/database')

//Get All Timeline From Database (Testing-Only)
const getAllTimeline = () => {
    const sqlQuery =   `SELECT * FROM timeline
                        ORDER BY project_id DESC`

    return dbPool.execute(sqlQuery)
}

//Get a Timeline Detail By ID
const getTimelineDetail = (timeline_id) => {
    const sqlQuery =   `SELECT * FROM timeline
                        WHERE timeline_id = ?`

    return dbPool.execute(sqlQuery, [timeline_id])
}

//Get Latest Incomplete Project Timeline Phase By Project ID
const getCurrentTimeline = (project_id) => {
    const sqlQuery =   `SELECT * FROM timeline
                        WHERE project_id = ? AND completed_date IS NULL
                        ORDER BY start_date ASC
                        LIMIT 1`

    return dbPool.execute(sqlQuery, [project_id])
}

//Get All Project Timeline By Project ID
const getAllTimelineProject = (project_id) => {
    const sqlQuery =   `SELECT * FROM timeline
                        WHERE project_id = ?
                        ORDER BY start_date ASC`
    
    return dbPool.execute(sqlQuery, [project_id])
}

const getTimelineApprovement = (timeline_id) => {
    const sqlQuery = `
        SELECT 
            client_approved, 
            leader_approved 
        FROM timeline 
        WHERE timeline_id = ?`

    return dbPool.execute(sqlQuery, [timeline_id])
}

//Create a New Project Timeline Phase
const createNewTimeline = (body) => {
    const sqlQuery =   `INSERT INTO timeline (project_id, project_phase, start_date, end_date)
                        VALUES (?, ?, ?, ?)`

    return dbPool.execute(sqlQuery, [body.project_id, body.project_phase, body.start_date, body.end_date])
}

//Update a Project Timeline Phase By ID
const updateTimeline = (body, timeline_id) => {
    const keys = Object.keys(body);
    const values = Object.values(body);

    //Custom Query Following By User Input
    const fields = keys.map(key => `${key} = ?`).join(', ')
    const sqlQuery = `UPDATE timeline SET ${fields} WHERE timeline_id = ?`

    return dbPool.execute(sqlQuery, [...values, timeline_id])
}

//Delete a Project Timeline Phase By ID
const deleteTimeline = (timeline_id) => {
    const sqlQuery = `DELETE FROM timeline WHERE timeline_id = ?`

    return dbPool.execute(sqlQuery, [timeline_id])
}

module.exports = {
    getAllTimeline,
    getTimelineDetail,
    getCurrentTimeline,
    getAllTimelineProject,
    getTimelineApprovement,
    createNewTimeline,
    updateTimeline,
    deleteTimeline
}