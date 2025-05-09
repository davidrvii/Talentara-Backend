const dbPool = require('../config/database')

const getAllTimeline = () => {
    const sqlQuery = `SELECT * FROM timeline`

    return dbPool.execute(sqlQuery)
}

const getTimelineDetail = (timeline_id) => {
    const sqlQuery =   `SELECT * FROM timeline
                        WHERE timeline_id = ?`

    return dbPool.execute(sqlQuery, [timeline_id])
}

const getCurrentTimeline = (project_id) => {
    const sqlQuery =   `SELECT * FROM timeline
                        WHERE project_id = ? AND complete_date IS NULL
                        ORDER BY start_date ASC
                        LIMIT 1`

    return dbPool.execute(sqlQuery, [project_id])
}

const getAllProjectTimeline = (project_id) => {
    const sqlQuery =   `SELECT * FROM timeline
                        WHERE project_id = ?
                        ORDER BY start_date ASC`
    
    return dbPool.execute(sqlQuery, [project_id])
}

const createNewTimeline = (body) => {
    const sqlQuery =   `INSERT INTO timeline (project_id, project_phase, start_date, end_date)
                        VALUES (?, ?, ?, ?)`

    return dbPool.execute(sqlQuery, [body.project_id, body.project_phase, body.start_date, body.end_date])
}

const updateProjectTimeline = (body, timeline_id) => {
    const keys = Object.keys(body);
    const values = Object.values(body);

    const fields = keys.map(key => `${key} = ?`).join(', ')
    const sqlQuery = `UPDATE timeline SET ${fields} WHERE timeline_id = ?`

    return dbPool.execute(sqlQuery, [...values, timeline_id])
}

const deleteProjectTimeline = (timeline_id) => {
    const sqlQuery = `DELETE FROM timeline WHERE timeline_id = ?`

    return dbPool.execute(sqlQuery, [timeline_id])
}

module.exports = {
    getAllTimeline,
    getTimelineDetail,
    getCurrentTimeline,
    getAllProjectTimeline,
    createNewTimeline,
    updateProjectTimeline,
    deleteProjectTimeline
}