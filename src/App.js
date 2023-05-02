import React, {useState, useEffect } from "react";
import { Button } from "antd";

import TaskCard from './components/task-card/TaskCard';
import NewTask from "./components/new-task/NewTask";
import TasksContext from "./contexts/TasksContext";
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setTasks([
      {
        id: 'DVD-01',
        title: 'Create DVD Library',
        project: 'DVD-Library',
        type: 'Task',
        status: 'Backlog',
        description: 'Create a DVD Library that stores and renders all DVDs owned.',
        comments: []
      }
    ]);
  }, []);

  const updateTasks = task => setTasks([...tasks, task]);

  return (

    <TasksContext.Provider value={tasks}>
      <h1>Project Tracker</h1>
      <div id="container">
        <Button id="create-task" onClick={() => setShowForm(true)}>Create New Task</Button>
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
      <NewTask showForm={showForm} setShowForm={setShowForm} project="DVD-Library" onSuccess={updateTasks}/>
    </TasksContext.Provider>
  );
}

export default App;
