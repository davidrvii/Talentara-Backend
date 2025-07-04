const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

// Pastikan folder ada
const imageDir = 'public/uploads/images/'
if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true })

// Dynamic storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imageDir)
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        const uniqueName = uuidv4() + ext
        cb(null, uniqueName)
    }
})

const fileFilter = (req, file, cb) => {
    const allowedFields = ['user_image']
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg']

    if (!allowedFields.includes(file.fieldname)) {
        return cb(new Error(`Field '${file.fieldname}' not allowed.`), false)
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error('Only JPG, JPEG, or PNG file allowed.'), false)
    }

    cb(null, true);
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

module.exports = upload;