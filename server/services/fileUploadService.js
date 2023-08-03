const cloudinary = require("cloudinary").v2;

const VALID_FILE_TYPES = [
    '.jpeg',
    '.jpg',
    '.gif',
    '.png',
    '.tiff',
    '.webp'
];

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const fileUpload = (fileBuffer, filename) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({
            use_filename: true,
            public_id: filename
        }, function (error, result) {
            if (error) {
                reject(error);
            }
            if (result) {
                resolve(result);
            }
        }).end(fileBuffer);
    });    
}

// function to create folders

module.exports = {
    VALID_FILE_TYPES,
    fileUpload
}