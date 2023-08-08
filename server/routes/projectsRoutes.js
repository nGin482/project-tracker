const express = require("express");
const lodash = require("lodash");

const projectsRouter = express.Router();

const Project = require("../models/ProjectSchema");
const Task = require("../models/TaskSchema");
const Utils = require("../../utilities/utils");

projectsRouter.get('/', async (request, response) => {
    const projects = await Project.find({}).populate('tasks').exec();
    return response.status(200).json(projects);
});

projectsRouter.post('/', async (request, response) => {
    const isAuthorisedUser = Utils.isAuthorised(request.headers)
    if (!isAuthorisedUser) {
        return response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to update this task');
    }

    if (!request.body || lodash.isEmpty(request.body)) {
        return response.status(400).send('Please provide details of a new project');
    }
    const newProject = new Project({...request.body, creator: isAuthorisedUser.username});
    const savedProject = await newProject.save();
    return response.status(200).json(savedProject);
});

projectsRouter.delete('/:project', async (request, response) => {
    if (!Utils.isAuthorised(request.headers)) {
        return response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to update this task');
    }

    const { project } = request.params;
    const checkProjectExists = await Project.exists({projectName: project});
    if (!checkProjectExists) {
        return response.status(404).send('Unable to find this project');
    }
    await Task.deleteMany({project: project});
    await Project.findOneAndDelete({projectName: project});
    return response.status(200).send('The project was deleted');
});

module.exports = projectsRouter;