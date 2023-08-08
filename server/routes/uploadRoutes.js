const express = require("express");
const multer = require("multer");

const Utils = require("../../utilities/utils");
const uploadHandle = require("../services/fileUploadService");

const uploadRouter = express.Router();

uploadRouter.post('/avatar', multer().single('avatar'), async (request, response) => {
    const file_upload_buffer = request.file.buffer;
    const fullFileName = request.file.originalname;
    const filenameWithoutExtension = fullFileName.slice(0, fullFileName.lastIndexOf('.'));
    const file_type = fullFileName.slice(fullFileName.lastIndexOf('.'));

    if (!uploadHandle.VALID_FILE_TYPES.includes(file_type)) {
        return response.status(400).send('An invalid file was uploaded')
    }

    try {
        const uploadResult = await uploadHandle.fileUpload(file_upload_buffer, filenameWithoutExtension);
        return response.status(200).send(uploadResult.url);
    }
    catch(error) {
        const responseJSON = {
            message: 'An error occurred when uploading your image, please try again',
            error: error.message
        };
        return response.status(500).json(responseJSON)
    }
});

uploadRouter.post('/task-image', multer().single('upload'), async (request, response) => {
    if (!Utils.isAuthorised(request.headers)) {
        return response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to update this task');
    }

    const file_upload_buffer = request.file.buffer;
    const fullFileName = request.file.originalname;
    const filenameWithoutExtension = fullFileName.slice(0, fullFileName.lastIndexOf('.'));
    try {
        const uploadResult = await uploadHandle.fileUpload(file_upload_buffer, filenameWithoutExtension);
        return response.status(200).json({url: uploadResult.url});
    }
    catch(error) {
        const responseJSON = {
            message: 'An error occurred when uploading your image, please try again',
            error: error.message
        };
        return response.status(500).json(responseJSON);
    }
});

module.exports = uploadRouter;