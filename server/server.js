const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const TaskUtils = require("../utilities/task_utils");
const Utils = require("../utilities/utils");
const mongoConnection = require("./mongo");
const Task = require("./models/TaskSchema");
const User = require("./models/UserSchema");
const Project = require("./models/projectSchema");
const Comment = require("./models/CommentsSchema");

const app = express();

mongoConnection();

app.use(cors());
app.use(express.json());

app.get('/', (request, response) => {
    response.send('<h1>Hello World</h1>')
})

app.get('/api/tasks', (request, response) => {
    Task.find().lean().then(tasks => {
        tasks.forEach(task => (
            delete task._id
        ))
        response.json(tasks);
    });
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
    if (!request.body) {
        response.status(500).json('Something went wrong');
    }
    if (!request.headers.authorization) {
        response.status(401).send('The request was not completed due to an unauthorised user');
    }
    else {
        const { authorization } = request.headers;
        const token = jwt.verify(Utils.checkToken(authorization), process.env.SECRET);
        if (!token && !token?.username) {
            response.status(401).send('The request was not completed due to an unauthorised user');
        }
        else {
            const tasks = await Task.find({project: request.body.project});
            const project = await Project.findOne({projectName: request.body.project});
            let currentTaskIDs = tasks.map(task => task.taskID);
            const taskID = TaskUtils.setTaskID(project.projectCode, currentTaskIDs);
            const newTask = {...request.body, taskID, reporter: token.username};
            if (request.body.linkedTasks) {
                const linkedTasks = await Task.find({taskID: {$in: request.body.linkedTasks}});
                const linkedTasksChecked = linkedTasks.filter(linkTask => linkTask._id);
                newTask.linkedTasks = linkedTasksChecked;
            }
            const taskDoc = new Task(newTask);
            const savedTask = await taskDoc.save();
            
            const user = await User.findOne({username: token.username});
            user.tasks = user.tasks.concat(savedTask._id);
            user.save();
    
            project.tasks = project.tasks.concat(savedTask._id);
            project.save();
            response.status(200).json({status: 'success', task: taskDoc});
        }
    }
})

app.put('/api/tasks/:taskID', async (request, response) => {
    const { authorization } = request.headers;
    if (!authorization) {
        response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to update this task');
    }
    else {
        const token = jwt.verify(Utils.checkToken(authorization), process.env.SECRET);
        if (!token && !token.username) {
            response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to update this task');
        }
        else {
            const { taskID } = request.params;
            const updatedTask = await Task.findOneAndReplace(
                {taskID: taskID},
                {...request.body},
                {new: true}
            );
            console.log(updatedTask)
            if (updatedTask) {
                response.status(200).json(updatedTask);
            }
            else {
                response.status(404).send(`Unable to find a task with ID ${taskID}`);
            }
        }
    }
})

app.patch('/api/tasks/:taskID', async (request, response) => {
    const { authorization } = request.headers;
    if (!authorization) {
        response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to update this task');
    }
    else {
        const token = jwt.verify(Utils.checkToken(authorization), process.env.SECRET);
        if (!token && !token.username) {
            response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to update this task');
        }
        else {
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
        }
    }
})

app.patch('/api/tasks/:taskID/link', async (request, response) => {
    const { authorization } = request.headers;
    if (!authorization) {
        response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to link these tasks');
    }
    else {
        const token = jwt.verify(Utils.checkToken(authorization), process.env.SECRET);
        if (!token && !token.username) {
            response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to link these tasks');
        }
        else {
            if (request.body.linkedTasks) {
                const { taskID } = request.params;
                const taskBeingLinked = await Task.findOne({taskID: taskID});
                const linkedTasks = await Task.find({taskID: {$in: request.body.linkedTasks}});
                const linkedTasksChecked = linkedTasks.filter(linkTask => linkTask._id);
                if (taskBeingLinked && linkedTasksChecked.length > 0) {
                    if (taskBeingLinked.linkedTasks) {
                        taskBeingLinked.linkedTasks = taskBeingLinked.linkedTasks.concat(linkedTasksChecked);
                        taskBeingLinked.save();
                        response.status(200).json({taskBeingLinked, linkedTasks});
                    }
                }
                else {
                    if (!taskBeingLinked && linkedTasksChecked.length > 0) {
                        response.status(404).send('The server cannot link these tasks together as the task being linked does not exist');
                    }
                    else if (taskBeingLinked && linkedTasksChecked.length === 0) {
                        response.status(404).send('The server cannot link these tasks together as there are no tasks to link');
                    }
                    else {
                        response.status(404).send('Unable to link these tasks together as they both do not exist');
                    }
                }
            }
            else {
                response.status(400).send('The request was sent without data. Please ensure that tasks are selected to be linked')
            }
        } 
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

app.delete('/api/tasks/:taskID', async (request, response) => {
    const { authorization } = request.headers;
    if (!authorization) {
        response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to link these tasks');
    }
    else {
        const token = jwt.verify(Utils.checkToken(authorization), process.env.SECRET);
        if (!token && !token.username) {
            response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to link these tasks');
        }
        else {
            const { taskID } = request.params;
            await Task.findOneAndDelete({taskID: taskID});
            response.status(200).send('The task was successfully deleted');
        }
    }
})

app.get('/api/projects', async (request, response) => {
    const projects = await Project.find({}).populate('tasks').exec();
    response.status(200).json(projects);
})

app.post('/api/projects', async (request, response) => {
    const { authorization } = request.headers;
    const token = jwt.verify(Utils.checkToken(authorization), process.env.SECRET);
    if (!token && !token?.username) {
        response.status(401).send('The request was not completed due to an unauthorised user')
    }
    else {
        const newProject = new Project({...request.body, creator: token.username});
        const savedProject = await newProject.save();
        response.status(200).json(savedProject);
    }
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

app.post('/api/register', async (request, response) => {
    const { username, password, email, image } = request.body;
    const checkUser = User.findOne({username: username});
    if (checkUser) {
        response.status(409).send("The username is already in use");
    }
    else {
        const pwHash = await bcrypt.hash(password, 14);
        const user = { username, password: pwHash, email, image };
        const newUser = new User(user);
        newUser.save();
        response.status(200).json({username, image});
    }

})

app.post('/api/login', async (request, response) => {
    const { username, password } = request.body;
    const user = await User.findOne({username: username}).populate('tasks').exec();
    if (user) {
        if (bcrypt.compareSync(password, user.password)) {
            const userForToken = {
                username: user.username,
                id: user._id
            }
            const token = jwt.sign(userForToken, process.env.SECRET);
            response.status(200).send({username: user.username, email: user.email, avatar: user.image, token});
        }
        else {
            response.status(401).send('The username or password is incorrect');
        }
    }
    else {
        response.status(401).send('The username or password is incorrect');
    }
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
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})