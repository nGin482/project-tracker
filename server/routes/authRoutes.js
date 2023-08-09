const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authRoutes = express.Router();

const User = require("../models/UserSchema");
const uploadHandle = require("../services/fileUploadService");
const errorMessages = require("../config");


authRoutes.post('/register', async (request, response) => {
    const { username, password, email, image } = request.body;
    const checkUser = await User.findOne({username: username});
    if (checkUser) {
        return response.status(409).send(errorMessages.INVALID_REGISTRATION);
    }
    else {
        const pwHash = await bcrypt.hash(password, 14);
        const user = { username, password: pwHash, email, image };
        const newUser = new User(user);
        newUser.save();
        try {
            await uploadHandle.createFolder(`Users/${username}`);
            const imageName = uploadHandle.getPublicIDFromURL(image);
            await uploadHandle.moveImage(imageName, `Users/${username}/${imageName}`);
            return response.status(200).json({username, image});
        }
        catch(err) {
            return response.status(500).json(err.message);
        }
    }
});

authRoutes.post('/login', async (request, response) => {
    const { username, password } = request.body;
    const user = await User.findOne({username: username}).populate('tasks').exec();
    if (!user) {
        return response.status(401).send(errorMessages.FAILED_LOGIN);
    }
    if (!bcrypt.compareSync(password, user.password)) {
        return response.status(401).send(errorMessages.FAILED_LOGIN);
    }
    const userForToken = {
        username: user.username,
        id: user._id
    };
    const token = jwt.sign(userForToken, process.env.SECRET);
    return response.status(200).send({username: user.username, email: user.email, avatar: user.image, token});
});

module.exports = authRoutes;