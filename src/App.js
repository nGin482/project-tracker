import React, {useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import { useCookies } from "react-cookie";

import IndexPage from "./pages/IndexPage";
import TaskPage from "./pages/TaskPage";
import LoginPage from "./pages/LoginPage";
import UserContext from "./contexts/UserContext";
import TasksContext from "./contexts/TasksContext";
import ErrorsContext from "./contexts/ErrorsContext";
import { getTasks } from "./services/requests";
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [cookie] = useCookies(['user']);
  const [user, setUser] = useState(cookie.user);
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

    <CookiesProvider>
      <UserContext.Provider value={{user, setUser}}>
        <TasksContext.Provider value={{tasks, setTasks}}>
          <ErrorsContext.Provider value={{errorMessage, setErrorMessage, errorType, setErrorType}}>
            <RouterProvider router={router} />
          </ErrorsContext.Provider>
        </TasksContext.Provider>
      </UserContext.Provider>
    </CookiesProvider>
  );
}

export default App;
