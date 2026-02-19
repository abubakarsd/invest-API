const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');
        const db = mongoose.connection.db;
        const files = await db.collection('uploads.files').find({}).toArray();
        console.log('GridFS Files:');
        files.forEach(f => {
            console.log(`- Filename: ${f.filename}, Length: ${f.length}`);
        });
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
