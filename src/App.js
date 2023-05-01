import React, {useState, useEffect } from "react";
import TaskCard from './components/task-card/TaskCard';
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

    <div id="container">
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}

export default App;
