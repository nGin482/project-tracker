const express = require("express");
const cors = require("cors");
const Utils = require("../utilities/task_utils");

const app = express();

app.use(cors());
app.use(express.json());

const tasks = [
    {
      id: 'DVD-01',
      title: 'Create DVD Library',
      project: 'DVD-Library',
      type: 'Task',
      status: 'Backlog',
      description: 'Create a DVD Library that stores and renders all DVDs owned.',
      comments: []
    }
  ]

app.get('/', (request, response) => {
    response.send('<h1>Hello World</h1>')
})

app.get('/api/tasks', (request, response) => {
    response.json(tasks);
})

app.post('/api/tasks', (request, response) => {
    if (!request.body) {
        response.status(500).json('Something went wrong')
    }
    const taskID = Utils.setTaskID('DVD', tasks.map(task => task.id))
    const newTask = {...request.body, id: taskID};
    tasks.push(newTask);
    response.status(200).json({status: 'success', task: newTask})
    
})

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})