const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const lodash = require("lodash");
require("dotenv").config();

const TaskUtils = require("../utilities/task_utils");
const Utils = require("../utilities/utils");
const mongoConnection = require("./mongo");
const Task = require("./models/TaskSchema");
const User = require("./models/UserSchema");
const Project = require("./models/projectSchema");

const app = express();

const mongo_uri = process.env.NODE_ENV === 'test'
    ? process.env.MONGO_TEST_URI
    : process.env.MONGODB_URI;

mongoConnection(mongo_uri);

app.use(cors());
app.use(express.json());

app.get('/', (request, response) => {
    response.send('<h1>Hello World</h1>')
})

app.get('/api/tasks', async (request, response) => {
    const tasks = await Task.find({});
    tasks.forEach(task => {
        delete task._id;
    })
    response.status(200).json(tasks);
})

app.get('/api/tasks/:taskID', async (request, response) => {
    const { taskID } = request.params;

    const task = await Task.findOne({taskID: taskID}).populate('linkedTasks').exec();

    if (task) {
        response.status(200).json(task)
    }
    else {
        response.status(404).send('This Task does not exist.')
    }
})

app.get('/api/tasks/project/:project', (request, response) => {
    const { project } = request.params;

    Task.find({project: project}).then(result => {
        response.status(200).json(result);
    })
})

app.post('/api/tasks', async (request, response) => {
    if (!request.headers.authorization) {
        return response.status(401).send('The request was not completed due to an unauthorised user');
    }
    const { authorization } = request.headers;
    const token = Utils.checkToken(authorization);
    let decodedToken = undefined;
    try {
        decodedToken = jwt.verify(token, process.env.SECRET);
    }
    catch(err) {
        decodedToken = {username: undefined};
    }
    if (!token || !decodedToken.username) {
        return response.status(401).send('The request was not completed due to an unauthorised user');
    }

    if (lodash.isEmpty(request.body)) {
        return response.status(400).send('No Task details were provided');
    }

    const tasks = await Task.find({project: request.body.project});
    const project = await Project.findOne({projectName: request.body.project});
    let currentTaskIDs = tasks.map(task => task.taskID);
    const taskID = TaskUtils.setTaskID(project.projectCode, currentTaskIDs);
    const newTask = {taskID, ...request.body, reporter: decodedToken.username};
    if (request.body.linkedTasks) {
        const linkedTasks = await Task.find({taskID: {$in: request.body.linkedTasks}});
        const linkedTasksChecked = linkedTasks.filter(linkTask => linkTask._id);
        newTask.linkedTasks = linkedTasksChecked;
    }
    const taskDoc = new Task(newTask);
    const savedTask = await taskDoc.save();
    
    const user = await User.findOne({username: decodedToken.username});
    user.tasks = user.tasks.concat(savedTask._id);
    user.save();

    project.tasks = project.tasks.concat(savedTask._id);
    project.save();
    response.status(201).json({status: 'success', task: taskDoc});
})

app.put('/api/tasks/:taskID', async (request, response) => {
    if (!request.headers.authorization) {
        return response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to update this task');
    }
    const { authorization } = request.headers;
    const token = Utils.checkToken(authorization);
    let decodedToken = undefined;
    try {
        decodedToken = jwt.verify(token, process.env.SECRET);
    }
    catch(err) {
        decodedToken = {username: undefined};
    }
    if (!token || !decodedToken.username) {
        return response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to update this task');
    }

    if (lodash.isEmpty(request.body)) {
        return response.status(400).send('No Task details were provided');
    }
    const { taskID } = request.params;
    const updatedTask = await Task.findOneAndReplace(
        {taskID: taskID},
        {...request.body},
        {new: true}
    );
    if (updatedTask) {
        response.status(200).json(updatedTask);
    }
    else {
        response.status(404).send(`Unable to find a task with ID ${taskID}`);
    }
})

app.patch('/api/tasks/:taskID', async (request, response) => {
    if (!request.headers.authorization) {
        return response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to update this task');
    }
    const { authorization } = request.headers;
    const token = Utils.checkToken(authorization);
    let decodedToken = undefined;
    try {
        decodedToken = jwt.verify(token, process.env.SECRET);
    }
    catch(err) {
        decodedToken = {username: undefined};
    }
    if (!token || !decodedToken.username) {
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
        response.status(200).json(updatedTask);
    }
    else {
        response.status(404).send(`Unable to find a task with ID ${taskID}`);
    }
})

app.patch('/api/tasks/:taskID/link', async (request, response) => {
    if (!request.headers.authorization) {
        return response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to update this task');
    }
    const { authorization } = request.headers;
    const token = Utils.checkToken(authorization);
    let decodedToken = undefined;
    try {
        decodedToken = jwt.verify(token, process.env.SECRET);
    }
    catch(err) {
        decodedToken = {username: undefined};
    }
    if (!token || !decodedToken.username) {
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
})

app.delete('/api/tasks/:taskID', async (request, response) => {
    if (!request.headers.authorization) {
        return response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to update this task');
    }
    const { authorization } = request.headers;
    const token = Utils.checkToken(authorization);
    let decodedToken = undefined;
    try {
        decodedToken = jwt.verify(token, process.env.SECRET);
    }
    catch(err) {
        decodedToken = {username: undefined};
    }
    if (!token || !decodedToken.username) {
        return response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to update this task');
    }
    
    const { taskID } = request.params;
    const taskExists = await Task.exists({taskID: taskID});
    if (!taskExists) {
        return response.status(404).send('Unable to find the task to delete');
    }
    await Task.findOneAndDelete({taskID: taskID});
    response.status(200).send('The task was successfully deleted');
})

app.get('/api/projects', async (request, response) => {
    const projects = await Project.find({}).populate('tasks').exec();
    response.status(200).json(projects);
})

app.post('/api/projects', async (request, response) => {
    if (!request.headers.authorization) {
        return response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to update this task');
    }
    const { authorization } = request.headers;
    const token = Utils.checkToken(authorization);
    let decodedToken = undefined;
    try {
        decodedToken = jwt.verify(token, process.env.SECRET);
    }
    catch(err) {
        decodedToken = {username: undefined};
    }
    if (!token || !decodedToken.username) {
        return response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to update this task');
    }

    if (!request.body || lodash.isEmpty(request.body)) {
        return response.status(400).send('Please provide details of a new project');
    }
    const newProject = new Project({...request.body, creator: token.username});
    const savedProject = await newProject.save();
    return response.status(200).json(savedProject);
})

app.post('/api/register', async (request, response) => {
    const { username, password, email, image } = request.body;
    const checkUser = await User.findOne({username: username});
    if (checkUser) {
        return response.status(409).send("The username is already in use");
    }
    const pwHash = await bcrypt.hash(password, 14);
    const user = { username, password: pwHash, email, image };
    const newUser = new User(user);
    newUser.save();
    return response.status(200).json({username, image});
})

app.post('/api/login', async (request, response) => {
    const { username, password } = request.body;
    const user = await User.findOne({username: username}).populate('tasks').exec();
    if (!user) {
        return response.status(401).send('The username or password is incorrect');
    }
    if (!bcrypt.compareSync(password, user.password)) {
        return response.status(401).send('The username or password is incorrect');
    }
    const userForToken = {
        username: user.username,
        id: user._id
    }
    const token = jwt.sign(userForToken, process.env.SECRET);
    return response.status(200).send({username: user.username, email: user.email, avatar: user.image, token});
})

app.get('/api/users/:username', async (request, response) => {
    const { username } = request.params;

    const user = await User.findOne({username: username}).populate('tasks').exec();
    if (user) {
        response.status(200).json(user);
    }
    else {
        response.status(404).send(`The server cannot find a user with the username ${username}`)
    }
})

const PORT = 3001;
const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})

module.exports = server;