const express = require("express");
const multer = require("multer");

const Utils = require("../../utilities/utils");
const uploadHandle = require("../services/fileUploadService");
const errorMessages = require("../config");

const uploadRouter = express.Router();

uploadRouter.post('/avatar', multer().single('avatar'), async (request, response) => {
    const file_upload_buffer = request.file.buffer;
    const fullFileName = request.file.originalname;
    const filenameWithoutExtension = fullFileName.slice(0, fullFileName.lastIndexOf('.'));
    const file_type = fullFileName.slice(fullFileName.lastIndexOf('.'));

    if (!uploadHandle.VALID_FILE_TYPES.includes(file_type)) {
        return response.status(400).send(errorMessages.FILE_UPLOAD_FAILED.INVALID_FILE);
    }

    try {
        const uploadResult = await uploadHandle.fileUpload(file_upload_buffer, filenameWithoutExtension);
        return response.status(200).send(uploadResult.url);
    }
    catch(error) {
        const responseJSON = {
            message: errorMessages.FILE_UPLOAD_FAILED.UPLOAD_ERROR,
            error: error.message
        };
        return response.status(500).json(responseJSON);
    }
});

uploadRouter.post('/task-image', multer().single('upload'), async (request, response) => {
    if (!Utils.isAuthorised(request.headers)) {
        return response.status(401).send(errorMessages.UNAUTHORISED_USER);
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
            message: errorMessages.FILE_UPLOAD_FAILED.UPLOAD_ERROR,
            error: error.message
        };
        return response.status(500).json(responseJSON);
    }
});

module.exports = uploadRouter;