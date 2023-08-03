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
};

const getPublicIDFromURL = imageURL => {
    let imageName = imageURL.slice(imageURL.lastIndexOf('/') + 1);
    imageName = imageName.slice(0, imageName.lastIndexOf('.'));
    return imageName;
};

const createFolder = folderName => {
    return cloudinary.api.create_folder(folderName);
};

const moveImage = (imageToMove, newDestination) => {
    return cloudinary.uploader.rename(imageToMove, newDestination);
}

module.exports = {
    VALID_FILE_TYPES,
    fileUpload,
    getPublicIDFromURL,
    createFolder,
    moveImage
}