require('dotenv').config();
const mongoose = require('mongoose');
const Expert = require('./models/Expert');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');
        const experts = await Expert.find({});
        for (const expert of experts) {
            // If expert has no avatar but has img (from old schema/mock), migrate it
            // Or if avatar is missing/broken, set to default
            if (!expert.avatar || expert.avatar === '22.jpg') {
                expert.avatar = '21.jpg'; // Verified existing image
            }
            // If the expert was created with the "Log Test" and has a valid filename in avatar, keep it.
            // But if the frontend was sending 'img', the backend might have ignored it or saved it elsewhere?
            // Wait, the backend model 'Expert.js' HAS 'avatar' field, not 'img'.
            // So 'img' sent from frontend would be lost unless schema validation was loose (it's not).

            // Let's just ensure all experts have a valid avatar string
            if (!expert.avatar.includes('.')) {
                expert.avatar = '21.jpg';
            }

            await expert.save();
            console.log(`Updated expert: ${expert.name} -> ${expert.avatar}`);
        }
        console.log('Migration complete');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
