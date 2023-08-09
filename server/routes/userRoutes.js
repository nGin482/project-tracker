const express = require("express");

const User = require("../models/UserSchema");
const errorMessages = require("../config");

const userRouter = express.Router();

userRouter.get('/:username', async (request, response) => {
    const { username } = request.params;

    const user = await User.findOne({username: username}).populate('tasks').exec();
    if (user) {
        return response.status(200).json(user);
    }
    else {
        return response.status(404).send(errorMessages.NOT_FOUND.USER_NOT_FOUND);
    }
});

module.exports = userRouter;