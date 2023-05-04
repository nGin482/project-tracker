import React, {useState, useEffect } from "react";
import { Button } from "antd";

import TaskCard from './components/task-card/TaskCard';
import NewTask from "./components/new-task/NewTask";
import TasksContext from "./contexts/TasksContext";
import { getTasks } from "./services/requests";
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getTasks().then(tasks => {
      setTasks(tasks)
    })
  }, []);

  return (

    <TasksContext.Provider value={{tasks, setTasks}}>
      <h1>Project Tracker</h1>
      <div id="container">
        <Button id="create-task" onClick={() => setShowForm(true)}>Create New Task</Button>
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
      <NewTask showForm={showForm} setShowForm={setShowForm} project="DVD-Library"/>
    </TasksContext.Provider>
  );
}

export default App;
