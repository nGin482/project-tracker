const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const lodash = require("lodash");
require("dotenv").config();

const TaskUtils = require("../utilities/task_utils");
const Utils = require("../utilities/utils");
const mongoConnection = require("./mongo");
const Task = require("./models/TaskSchema");
const User = require("./models/UserSchema");
const Project = require("./models/projectSchema");
const uploadHandle = require("./services/fileUploadService");
const Comment = require("./models/CommentsSchema");

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
    for (const linkedTaskID of taskDoc.linkedTasks) {
        const linkedTask = await Task.findById(linkedTaskID);
        linkedTask.linkedTasks = linkedTask.linkedTasks.concat(taskDoc._id);
        linkedTask.save();
    }
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

app.post('/api/tasks/:taskID/comment', async (request, response) => {
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
    const task = await Task.findOne({taskID: taskID});
    if (!task) {
        return response.status(404).send('The server is unable to find the task to comment on');
    }

    const allComments = await Comment.find({});
    const comment = new Comment({
        commentID: TaskUtils.setCommentID(allComments),
        ...request.body,
        commenter: decodedToken.id,
        task: task._id
    });
    const savedComment = await comment.save();

    task.comments = task.comments.concat(savedComment._id);
    await task.save();

    await Task.populate(task, 'linkedTasks')
    await Task.populate(task, {
        path: 'comments',
        populate: {
            path: 'commenter',
            select: 'username'
        }
    });

    // add to user's comments
    const user = await User.findOne({username: decodedToken.username});
    user.comments = user.comments.concat(savedComment._id);
    await user.save();

    return response.status(201).json(task);
})

app.patch('/api/tasks/:taskID/comment/:commentID', async (request, response) => {
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
    
    const { taskID, commentID} = request.params;

    const task = await Task.findOne({taskID: taskID});
    if (!task) {
        return response.status(404).send('The task you were looking for does not exist');
    }
    const comment = await Comment.findOne({commentID: commentID});
    if (!comment) {
        return response.status(404).send('The comment you were looking for does not exist');
    }
    comment.set('content', request.body.content);
    await comment.save();

    await Task.populate(task, 'linkedTasks')
    await Task.populate(task, {
        path: 'comments',
        populate: {
            path: 'commenter',
            select: 'username'
        }
    });
    return response.status(200).json(task);
})

app.delete('/api/tasks/:taskID/comment/:commentID', async (request, response) => {
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

    const { taskID, commentID } = request.params;

    const task = await Task.findOne({taskID: taskID});
    if (!task) {
        return response.status(404).send('The task you were looking for does not exist');
    }

    const comment = await Comment.findOne({commentID: commentID});
    if (!comment) {
        return response.status(404).send('The comment you were looking for does not exist');
    }

    const user = await User.findOne({username: decodedToken.username});
    const updatedUserComments = user.comments.filter(comment => comment.commentID !== commentID);
    user.set('comments', updatedUserComments);
    await user.save();

    const updatedTaskComments = task.comments.filter(comment => comment.commentID !== commentID);
    task.set('comments', updatedTaskComments);
    await task.save();

    await Comment.findOneAndDelete({commentID: commentID});
    await Task.populate(task, 'linkedTasks')
    await Task.populate(task, {
        path: 'comments',
        populate: {
            path: 'commenter',
            select: 'username'
        }
    });
    return response.status(200).json({message: 'The comment was successfully deleted', task});
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

app.delete('/api/projects/:project', async (request, response) => {
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

    const { project } = request.params;
    const checkProjectExists = await Project.exists({projectName: project});
    if (!checkProjectExists) {
        return response.status(404).send('Unable to find this project');
    }
    await Task.deleteMany({project: project});
    await Project.findOneAndDelete({projectName: project});
    return response.status(200).send('The project was deleted');
})

app.post('/api/upload-avatar', multer().single('avatar'), async (request, response) => {
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
})

app.post('/api/task-uploads', multer().single('upload'), async (request, response) => {
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
        return response.status(500).json(responseJSON)
    }
})

app.post('/api/register', async (request, response) => {
    const { username, password, email, image } = request.body;
    const checkUser = await User.findOne({username: username});
    if (checkUser) {
        return response.status(409).send("The username is already in use");
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