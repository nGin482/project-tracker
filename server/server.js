const express = require("express");
const cors = require("cors");
require("dotenv").config();

const Utils = require("../utilities/task_utils");
const mongoConnection = require("./mongo");
const Task = require("./models/TaskSchema");

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

app.get('/api/tasks/:taskID', (request, response) => {
    const { taskID } = request.params;
    
    Task.findOne({taskID: taskID}).then(result => {
        response.status(200).json(result);
    }).catch(err => {
        response.status(404).send(`The Task you were looking for doesn't exist.`);
    })
})

app.get('/api/tasks/project/:project', (request, response) => {
    const { project } = request.params;

    Task.find({project: project}).then(result => {
        response.status(200).json(result);
    })
})

app.post('/api/tasks', (request, response) => {
    if (!request.body) {
        response.status(500).json('Something went wrong');
    }
    Task.find().then(result => {
        let currentTaskIDs = result.map(task => task.id)
        const taskID = Utils.setTaskID('DVD', currentTaskIDs);
        const newTask = {...request.body, taskID: taskID, creator: 'Natalie'};
        const taskObj = new Task(newTask);
        taskObj.save();
        response.status(200).json({status: 'success', task: taskObj});
    })
})

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})