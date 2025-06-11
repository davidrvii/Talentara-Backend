const logRequest = (req, res, next) => {
    console.log('Terjadi request ke PATH: ', req.path)
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
    next()
}

module.exports = logRequest