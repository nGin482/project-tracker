const express = require("express");
const lodash = require("lodash");

const taskRoutes = express.Router();

const Task = require("../models/TaskSchema");
const User = require("../models/UserSchema");
const Comment = require("../models/CommentsSchema");
const Project = require("../models/ProjectSchema");

const Utils = require("../../utilities/utils");
const TaskUtils = require("../../utilities/task_utils");

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
    else {
        return response.status(404).send('This Task does not exist.')
    }
});

taskRoutes.post('/', async (request, response) => {
    const isAuthorisedUser = Utils.isAuthorised(request.headers)
    if (!isAuthorisedUser) {
        return response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to update this task');
    }
    
    if (lodash.isEmpty(request.body)) {
        return response.status(400).send('No Task details were provided');
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
    return response.status(201).json({status: 'success', task: taskDoc});
});

taskRoutes.put('/:taskID', async (request, response) => {
    const isAuthorisedUser = Utils.isAuthorised(request.headers)
    if (!isAuthorisedUser) {
        return response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to update this task');
    }

    if (lodash.isEmpty(request.body)) {
        return response.status(400).send('No Task details were provided');
    }
    const { taskID } = request.params;
    const task = await Task.findOne({taskID: taskID});
    request.body.linkedTasks = task.linkedTasks;
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
    else {
        return response.status(404).send(`Unable to find a task with ID ${taskID}`);
    }
});

taskRoutes.patch('/:taskID', async (request, response) => {
    const isAuthorisedUser = Utils.isAuthorised(request.headers)
    if (!isAuthorisedUser) {
        return response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to update this task');
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
    else {
        return response.status(404).send(`Unable to find a task with ID ${taskID}`);
    }
});

taskRoutes.patch('/:taskID/link', async (request, response) => {
    const isAuthorisedUser = Utils.isAuthorised(request.headers)
    if (!isAuthorisedUser) {
        return response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to update this task');
    }

    if (!request.body.linkedTasks || lodash.isEmpty(request.body.linkedTasks)) {
        return response.status(400).send('The request was sent without data. Please ensure that tasks are selected to be linked');
    }

    const { taskID } = request.params;
    const taskBeingLinked = await Task.findOne({taskID: taskID});
    
    if (!taskBeingLinked || lodash.isEmpty(taskBeingLinked)) {
        return response.status(404).send('The server cannot link these tasks together as the task being linked does not exist');
    }

    const linkedTasks = await Task.find({taskID: {$in: request.body.linkedTasks}});
    const linkedTasksChecked = linkedTasks.filter(linkTask => linkTask._id);
    if (linkedTasksChecked.length === request.body.linkedTasks.length) {
        taskBeingLinked.linkedTasks = taskBeingLinked.linkedTasks.concat(linkedTasksChecked);
        taskBeingLinked.save();
        return response.status(200).json({taskBeingLinked, linkedTasks});
    }
    else if (linkedTasksChecked.length === 0) {
        return response.status(404).send('The server cannot find the tasks to link');
    }
    else {
        return response.status(404).send('The server cannot find all the tasks to link');
   }        
});

taskRoutes.delete('/:taskID', async (request, response) => {
    const isAuthorisedUser = Utils.isAuthorised(request.headers)
    if (!isAuthorisedUser) {
        return response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to update this task');
    }
    
    const { taskID } = request.params;
    const taskExists = await Task.exists({taskID: taskID});
    if (!taskExists) {
        return response.status(404).send('Unable to find the task to delete');
    }
    await Task.findOneAndDelete({taskID: taskID});
    return response.status(200).send('The task was successfully deleted');
});

module.exports = taskRoutes;