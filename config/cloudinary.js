const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary using the CLOUDINARY_URL environment variable
// Example CLOUDINARY_URL=cloudinary://<your_api_key>:<your_api_secret>@<your_cloud_name>
if (!process.env.CLOUDINARY_URL) {
    console.warn('Warning: CLOUDINARY_URL is not set in environment variables.');
}

// Configuration is automatically extracted from CLOUDINARY_URL
// You can also explicitly configure it if needed, but it's not required when using the CLOUDINARY_URL.
// cloudinary.config({
//   secure: true // Optional: Force HTTPS
// });

module.exports = cloudinary;
