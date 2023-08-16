const express = require("express");
const lodash = require("lodash");

const taskRoutes = express.Router();

const Task = require("../models/TaskSchema");
const User = require("../models/UserSchema");
const Project = require("../models/ProjectSchema");

const Utils = require("../../utilities/utils");
const TaskUtils = require("../../utilities/task_utils");
const responseMessages = require("../config");

taskRoutes.get('/', async (request, response) => {
    const tasks = await Task.find({});
    tasks.forEach(task => {
        delete task._id;
    })
    return response.status(200).json(tasks);
});

taskRoutes.get('/:taskID', async (request, response) => {
    const { taskID } = request.params;

    const task = await Task.findOne({taskID: taskID})
        .populate('linkedTasks')
        .populate({
            path: 'comments',
            populate: {
                path: 'commenter',
                select: 'username'
            }
        })
        .exec();

    if (task) {
        return response.status(200).json(task)
    }
    return response.status(404).send(responseMessages.NOT_FOUND.TASK_NOT_FOUND);
});

taskRoutes.get('/project/:project', async (request, response) => {
    const { project } = request.params;

    if (!project || project === 'undefined') {
        return response.status(404).send('Please specify a project to search for');
    }

    const tasksByProject = await Task.find({project: project});
    return response.status(200).json(tasksByProject);
});

taskRoutes.post('/', async (request, response) => {
    const isAuthorisedUser = Utils.isAuthorised(request.headers)
    if (!isAuthorisedUser) {
        return response.status(401).send(responseMessages.UNAUTHORISED_USER);
    }
    
    if (lodash.isEmpty(request.body)) {
        return response.status(400).send(responseMessages.BAD_REQUEST.INVAID_TASK_DETAILS);
    }

    const tasks = await Task.find({project: request.body.project});
    const project = await Project.findOne({projectName: request.body.project});
    let currentTaskIDs = tasks.map(task => task.taskID);
    const taskID = TaskUtils.setTaskID(project.projectCode, currentTaskIDs);
    const newTask = {taskID, ...request.body, reporter: isAuthorisedUser.username};
    if (request.body.linkedTasks) {
        const linkedTasks = await Task.find({taskID: {$in: request.body.linkedTasks}});
        const linkedTasksChecked = linkedTasks.filter(linkTask => linkTask._id);
        newTask.linkedTasks = linkedTasksChecked;
    }
    const taskDoc = new Task(newTask);
    for (const linkedTaskID of taskDoc.linkedTasks) {
        const linkedTask = await Task.findById(linkedTaskID);
        linkedTask.linkedTasks = linkedTask.linkedTasks.concat(taskDoc._id);
        linkedTask.save();
    }
    const savedTask = await taskDoc.save();
    
    const user = await User.findOne({username: isAuthorisedUser.username});
    user.tasks = user.tasks.concat(savedTask._id);
    user.save();

    project.tasks = project.tasks.concat(savedTask._id);
    project.save();
    return response.status(201).json(taskDoc);
});

taskRoutes.put('/:taskID', async (request, response) => {
    const isAuthorisedUser = Utils.isAuthorised(request.headers)
    if (!isAuthorisedUser) {
        return response.status(401).send(responseMessages.UNAUTHORISED_USER);
    }

    if (lodash.isEmpty(request.body)) {
        return response.status(400).send(responseMessages.BAD_REQUEST.INVAID_TASK_DETAILS);
    }
    const { taskID } = request.params;
    const taskCheck = await Task.exists({taskID: taskID});
    if (!taskCheck) {
        return response.status(404).send(responseMessages.NOT_FOUND.TASK_NOT_FOUND);
    }

    request.body.linkedTasks = taskCheck.linkedTasks;
    const updatedTask = await Task.findOneAndReplace(
        {taskID: taskID},
        {...request.body},
        {new: true}
    )
        .populate('linkedTasks')
        .populate({
            path: 'comments',
            populate: {
                path: 'commenter',
                select: 'username'
            }
        })
        .exec();
    if (updatedTask) {
        return response.status(200).json(updatedTask);
    }
});

taskRoutes.patch('/:taskID', async (request, response) => {
    const isAuthorisedUser = Utils.isAuthorised(request.headers)
    if (!isAuthorisedUser) {
        return response.status(401).send(responseMessages.UNAUTHORISED_USER);
    }

    const taskID = request.params.taskID;
    const { field, value } = request.body;
    const updatedTask = await Task.findOneAndUpdate(
        {taskID: taskID},
        {[field]: value},
        {new: true}
    );
    if (updatedTask) {
        return response.status(200).json(updatedTask);
    }
    return response.status(404).send(responseMessages.NOT_FOUND.TASK_NOT_FOUND);
});

taskRoutes.patch('/:taskID/link', async (request, response) => {
    const isAuthorisedUser = Utils.isAuthorised(request.headers)
    if (!isAuthorisedUser) {
        return response.status(401).send(responseMessages.UNAUTHORISED_USER);
    }

    if (!request.body.linkedTasks || lodash.isEmpty(request.body.linkedTasks)) {
        return response.status(400).send(responseMessages.BAD_REQUEST.NO_TASKS_LINKED);
    }

    const { taskID } = request.params;
    const taskBeingLinked = await Task.findOne({taskID: taskID});
    
    if (!taskBeingLinked || lodash.isEmpty(taskBeingLinked)) {
        return response.status(404).send(responseMessages.NOT_FOUND.TASK_NOT_FOUND);
    }

    const linkedTasks = await Task.find({taskID: {$in: request.body.linkedTasks}});
    const linkedTasksChecked = linkedTasks.filter(linkTask => linkTask._id);
    if (linkedTasksChecked.length === request.body.linkedTasks.length) {
        taskBeingLinked.linkedTasks = taskBeingLinked.linkedTasks.concat(linkedTasksChecked);
        taskBeingLinked.save();
        return response.status(200).json({taskBeingLinked, linkedTasks});
    }
    else if (linkedTasksChecked.length === 0) {
        return response.status(404).send(responseMessages.NOT_FOUND.TASKS_TO_LINK);
    }
    else {
        return response.status(404).send(responseMessages.NOT_FOUND.ALL_TASKS_TO_LINK);
   }        
});

taskRoutes.delete('/:taskID', async (request, response) => {
    const isAuthorisedUser = Utils.isAuthorised(request.headers)
    if (!isAuthorisedUser) {
        return response.status(401).send(responseMessages.UNAUTHORISED_USER);
    }
    
    const { taskID } = request.params;
    const taskExists = await Task.findOne({taskID: taskID});
    if (!taskExists) {
        return response.status(404).send(responseMessages.NOT_FOUND.TASK_NOT_FOUND);
    }
    await Task.findOneAndDelete({taskID: taskID});
    
    const project = await Project.findOne({projectName: taskExists.project});
    project.set('tasks', project.tasks.filter(task => task.toString() !== taskExists._id.toString()));
    await project.save();
    
    return response.status(200).send(responseMessages.SUCCESS.TASK_DELETED);
});

module.exports = taskRoutes;