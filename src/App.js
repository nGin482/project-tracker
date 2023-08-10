import React, {useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CookiesProvider, useCookies } from "react-cookie";

import IndexPage from "./pages/IndexPage";
import TaskPage from "./pages/TaskPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import UserContext from "./contexts/UserContext";
import ErrorsContext from "./contexts/ErrorsContext";
import ProjectContext from "./contexts/ProjectContext";
import { getProjects } from "./requests/projectRequests";
import './App.css';

function App() {
  const [projects, setProjects] = useState([]);
  const [projectViewed, setProjectViewed] = useState('All');
  const [cookie] = useCookies(['user']);
  const [user, setUser] = useState(cookie.user);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorType, setErrorType] = useState('');

  useEffect(() => {
    getProjects().then(data => {
      setProjects(data);
    })
  }, []);

  const router = createBrowserRouter([
    {
      path: '/',
      element: <IndexPage projects={projects} />
    },
    {
      path: '/task/:taskID',
      element: <TaskPage />
    },
    {
      path: '/login',
      element: <LoginPage />
    },
    {
      path: '/profile/:username',
      element: <ProfilePage />
    }
  ]);

  return (
    <CookiesProvider>
      <UserContext.Provider value={{user, setUser}}>
        <ProjectContext.Provider value={{projects, setProjects, projectViewed, setProjectViewed}}>
          <ErrorsContext.Provider value={{errorMessage, setErrorMessage, errorType, setErrorType}}>
            <RouterProvider router={router} />
          </ErrorsContext.Provider>
        </ProjectContext.Provider>
      </UserContext.Provider>
    </CookiesProvider>
  );
};

export default App;
