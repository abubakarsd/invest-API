const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');
        const db = mongoose.connection.db;

        console.log('Collections:');
        const collections = await db.listCollections().toArray();
        collections.forEach(c => console.log(`- ${c.name}`));

        console.log('\nChecking uploads.files...');
        const files = await db.collection('uploads.files').find({}).toArray();
        files.forEach(f => {
            console.log(`- Filename: ${f.filename}, Length: ${f.length}`);
        });

        console.log('\nChecking fs.files (default bucket)...');
        const fsFiles = await db.collection('fs.files').find({}).toArray();
        fsFiles.forEach(f => {
            console.log(`- Filename: ${f.filename}, Length: ${f.length}`);
        });

        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
