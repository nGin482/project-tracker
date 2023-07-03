import axios from "axios";

const baseURL = 'http://localhost:3001/api/'
const authHeader = token => {
    return {headers: {"Authorization": `Bearer ${token}`}}
}


const getTasks = () => {
    return axios.get(`${baseURL}tasks`).then(response => response.data);
}
const getTask = taskID => {
    return axios.get(`${baseURL}tasks/${taskID}`).then(response => response.data);
}
const getTasksByProject = project => {
    return axios.get(`${baseURL}tasks/project/${project}`).then(response => response.data);
}
const createTask = (task, token) => {
    return axios.post(`${baseURL}tasks`, task, authHeader(token)).then(response => response.data);
}
const updateTaskDetail = (taskID, newDetails, token) => {
    return axios.patch(`${baseURL}tasks/${taskID}`, newDetails, authHeader(token)).then(response => response.data);
}
const linkTasks = (taskID, tasks, token) => {
    return axios.patch(`${baseURL}tasks/${taskID}/link`, tasks, authHeader(token)).then(response => response.data);
}
const deleteTask = (taskID, token) => {
    return axios.delete(`${baseURL}tasks/${taskID}`, authHeader(token)).then(response => response.data);
}

const getProjects = () => {
    return axios.get(`${baseURL}projects`).then(response => response.data);
}
const createProject = (project, token) => {
    return axios.post(`${baseURL}projects`, project, authHeader(token)).then(response => response.data);
}

const register = newUser => {
    return axios.post(`${baseURL}register`, newUser).then(response => response.data)
}
const login = (username, password) => {
    return axios.post(`${baseURL}login`, {username, password}).then(response => response.data)
}
const fetchUser = username => {
    return axios.get(`${baseURL}users/${username}`).then(response => response.data)
}


export {
    getTasks,
    getTask,
    getTasksByProject,
    createTask,
    updateTaskDetail,
    linkTasks,
    deleteTask,
    getProjects,
    createProject,
    register,
    login,
    fetchUser
}
