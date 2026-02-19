const fs = require('fs');
const path = require('path');

// Mocking the function from admin.js
const saveBase64Image = (base64String, prefix) => {
    console.log('--- saveBase64Image Start ---');
    console.log('Prefix:', prefix);

    if (!base64String || !base64String.startsWith('data:image')) {
        console.log('Not a base64 string');
        return base64String;
    }

    const matches = base64String.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches) {
        console.log('Regex match failed');
        return base64String;
    }

    const ext = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');

    // Path to React App's public assets (Local Development Setup)
    // NOTE: This path must match exactly what is in admin.js relative to where THIS script is run
    // Since we run from root, and admin.js is in backend/controllers...
    // In admin.js: path.join(__dirname, '../../react-app/public/assets/dashboard/images')
    // Here we will use absolute path to be sure, or mimic the structure.

    // Let's use the exact logic from admin.js but adapted for this script's location
    // Script is in backend/scripts
    const uploadDir = path.join(__dirname, '../../react-app/public/assets/dashboard/images');

    console.log('Upload Dir:', uploadDir);

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
        console.log('Directory does not exist, creating...');
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${prefix}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, filename);
    console.log('Writing to:', filePath);

    try {
        fs.writeFileSync(filePath, buffer);
        console.log('File written successfully');
    } catch (err) {
        console.error('File write failed:', err);
    }

    return filename;
};

// Test Data (Small 1x1 pixel red dot)
const base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const result = saveBase64Image(base64, 'test-icon');
console.log('Result Filename:', result);
