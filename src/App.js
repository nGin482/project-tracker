import React, {useState, useEffect } from "react";

import TaskCard from './components/task-card/TaskCard';
import TasksContext from "./contexts/TasksContext";
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);

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

  return (

    <TasksContext.Provider value={tasks}>
      <div id="container">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </TasksContext.Provider>
  );
}

export default App;
