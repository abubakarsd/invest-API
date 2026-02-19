const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
require('dotenv').config();

if (!process.env.MONGO_URI) {
    console.error('FATAL: MONGO_URI is not defined in upload.js');
}

const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        console.log('Processing file upload:', file.originalname);
        return new Promise((resolve, reject) => {
            const filename = `${Date.now()}-${file.originalname}`;
            const fileInfo = {
                filename: filename,
                bucketName: 'uploads' // Collection name will be uploads.files and uploads.chunks
            };
            resolve(fileInfo);
        });
    }
});

storage.on('connection', (db) => {
    console.log('Multer GridFS Connected to DB');
});

storage.on('connectionFailed', (err) => {
    console.error('Multer GridFS Connection Failed:', err);
});

const upload = multer({ storage });

module.exports = upload;
