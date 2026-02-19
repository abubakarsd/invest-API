const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

let gfs;

const conn = mongoose.connection;

conn.once('open', () => {
    // Init stream
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
});

// @route GET /api/images/:filename
// @desc Display Image
router.get('/:filename', async (req, res) => {
    try {
        const file = await conn.db.collection('uploads.files').findOne({ filename: req.params.filename });

        if (!file || file.length === 0) {
            return res.status(404).json({ err: 'No file exists' });
        }

        // Check if image
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png' || file.contentType === 'image/svg+xml') {
            // Read output to browser
            const readstream = gfs.openDownloadStreamByName(file.filename);
            readstream.pipe(res);
        } else {
            res.status(404).json({ err: 'Not an image' });
        }
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

module.exports = router;
