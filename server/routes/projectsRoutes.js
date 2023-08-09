const express = require("express");
const lodash = require("lodash");

const projectsRouter = express.Router();

const Project = require("../models/ProjectSchema");
const Task = require("../models/TaskSchema");
const Utils = require("../../utilities/utils");
const responseMessages = require("../config");

projectsRouter.get('/', async (request, response) => {
    const projects = await Project.find({}).populate('tasks').exec();
    return response.status(200).json(projects);
});

projectsRouter.post('/', async (request, response) => {
    const isAuthorisedUser = Utils.isAuthorised(request.headers)
    if (!isAuthorisedUser) {
        return response.status(401).send(responseMessages.UNAUTHORISED_USER);
    }

    if (!request.body || lodash.isEmpty(request.body)) {
        return response.status(400).send(responseMessages.BAD_REQUEST.INVALID_PROJECT_DETAILS);
    }
    const newProject = new Project({...request.body, creator: isAuthorisedUser.username});
    const savedProject = await newProject.save();
    return response.status(200).json(savedProject);
});

projectsRouter.delete('/:project', async (request, response) => {
    if (!Utils.isAuthorised(request.headers)) {
        return response.status(401).send(responseMessages.UNAUTHORISED.USER_UNAUTHORISED);
    }

    const { project } = request.params;
    const checkProjectExists = await Project.exists({projectName: project});
    if (!checkProjectExists) {
        return response.status(404).send(responseMessages.NOT_FOUND.PROJECT_NOT_FOUND);
    }
    await Task.deleteMany({project: project});
    await Project.findOneAndDelete({projectName: project});
    return response.status(200).send(responseMessages.SUCCESS.PROJECT_DELETED);
});

module.exports = projectsRouter;