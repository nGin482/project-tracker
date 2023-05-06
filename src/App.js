import React, {useState, useEffect } from "react";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import IndexPage from "./pages/IndexPage";
import TasksContext from "./contexts/TasksContext";
import { getTasks } from "./services/requests";
import './App.css';
import TaskPage from "./pages/TaskPage";

function App() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    getTasks().then(tasks => {
      setTasks(tasks)
    })
  }, []);

  const router = createBrowserRouter([
    {
      path: '/',
      element: <IndexPage />
    },
    {
      path: '/task/:taskID',
      element: <TaskPage />
    }
  ]);

  return (

    <TasksContext.Provider value={{tasks, setTasks}}>
      <RouterProvider router={router} />
    </TasksContext.Provider>
  );
}

export default App;
