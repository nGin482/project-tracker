import React, {useState, useEffect } from "react";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import IndexPage from "./pages/IndexPage";
import TaskPage from "./pages/TaskPage";
import TasksContext from "./contexts/TasksContext";
import ErrorsContext from "./contexts/ErrorsContext";
import { getTasks } from "./services/requests";
import './App.css';
import LoginPage from "./pages/LoginPage";

function App() {
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorType, setErrorType] = useState('');

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
    },
    {
      path: '/login',
      element: <LoginPage />
    }
  ]);

  return (

    <TasksContext.Provider value={{tasks, setTasks}}>
      <ErrorsContext.Provider value={{errorMessage, setErrorMessage, errorType, setErrorType}}>
        <RouterProvider router={router} />
      </ErrorsContext.Provider>
    </TasksContext.Provider>
  );
}

export default App;
