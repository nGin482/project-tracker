const express = require("express");
const cors = require("cors");
const Utils = require("../utilities/task_utils");
const Task = require("./models/taskSchema");

const app = express();

app.use(cors());
app.use(express.json());

const currentDate = new Date()
const tasks = [
    {
      id: 'DVD-1',
      title: 'Create DVD Library',
      project: 'DVD-Library',
      type: 'Task',
      status: 'Backlog',
      description: 'Create a DVD Library that stores and renders all DVDs owned.',
      created: `${currentDate.toDateString()} ${currentDate.toLocaleTimeString([], {hour12: false})}`,
      comments: []
    }
  ]

app.get('/', (request, response) => {
    response.send('<h1>Hello World</h1>')
})

app.get('/api/tasks', (request, response) => {
    response.json(tasks);
})

app.get('/api/tasks/:taskID', (request, response) => {
    const { taskID } = request.params;
    
    const task = tasks.find(task => task.id === taskID);
    if (task) {
        response.status(200).json(task);
    }
    else {
        response.status(404).send(`The Task you were looking for doesn't exist.`);
    }
})

app.post('/api/tasks', (request, response) => {
    if (!request.body) {
        response.status(500).json('Something went wrong');
    }
    const taskID = Utils.setTaskID('DVD', tasks.map(task => task.id));
    const newTask = {...request.body, id: taskID};
    tasks.push(newTask);
    response.status(200).json({status: 'success', task: newTask});
})

app.get('/api/tasks/project/:project', (request, response) => {
    const { project } = request.params;

    const tasksByProject = tasks.filter(task => task.project === project);
    response.status(200).json(tasksByProject);
})

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})