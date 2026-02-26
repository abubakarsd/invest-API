const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'invest-platform',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
        // transformation: [{ width: 500, height: 500, crop: 'limit' }]
    },
});

const upload = multer({ storage });

module.exports = upload;
