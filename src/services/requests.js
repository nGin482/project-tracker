import axios from "axios";

const baseURL = 'http://localhost:3001/api/'
const authHeader = {headers: {}}


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
    return axios.post(`${baseURL}tasks`, task, {headers: {"Authorization": `Bearer ${token}`}}).then(response => response.data);
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
    register,
    login,
    fetchUser
}
