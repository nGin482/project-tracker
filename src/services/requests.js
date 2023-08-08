import axios from "axios";

const baseURL = 'http://localhost:3001/api/'
const authHeader = token => {
    return {headers: {"Authorization": `Bearer ${token}`}}
}
const formDataHeader = () => {
    return {headers: {"content-type": "multipart/form-data"}}
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
const updateTask = (taskID, newTaskObject, token) => {
    return axios.put(`${baseURL}tasks/${taskID}`, newTaskObject, authHeader(token)).then(response => response.data);
}
const updateTaskDetail = (taskID, newDetails, token) => {
    return axios.patch(`${baseURL}tasks/${taskID}`, newDetails, authHeader(token)).then(response => response.data);
}
const linkTasks = (taskID, tasks, token) => {
    return axios.patch(`${baseURL}tasks/${taskID}/link`, tasks, authHeader(token)).then(response => response.data);
}
const commentTask = (taskID, comment, token) => {
    return axios.post(`${baseURL}tasks/${taskID}/comment`, {content: comment}, authHeader(token)).then(response => response.data);
}
const editComment = (taskID, commentID, newContent, token) => {
    return axios.patch(`${baseURL}tasks/${taskID}/comment/${commentID}`, {content: newContent}, authHeader(token)).then(response => response.data);
}
const deleteComment = (taskID, commentID, token) => {
    return axios.delete(`${baseURL}tasks/${taskID}/comment/${commentID}`, authHeader(token)).then(response => response.data);
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
const deleteProject = (project, token) => {
    return axios.delete(`${baseURL}projects/${project}`, authHeader(token)).then(response => response.data);
}

const register = newUser => {
    return axios.post(`${baseURL}register`, newUser).then(response => response.data);
}
const login = (username, password) => {
    return axios.post(`${baseURL}login`, {username, password}).then(response => response.data);
}
const fetchUser = username => {
    return axios.get(`${baseURL}users/${username}`).then(response => response.data);
}
const uploadAvatar = file => {
    return axios.post(`${baseURL}upload-avatar`, file, formDataHeader).then(response => response.data);
}
const uploadTaskImage = (file, token) => {
    return axios.post(`${baseURL}task-uploads`, file, authHeader(token)).then(response => response.data);
}


export {
    getTasks,
    getTask,
    getTasksByProject,
    createTask,
    updateTask,
    updateTaskDetail,
    linkTasks,
    commentTask,
    editComment,
    deleteComment,
    deleteTask,
    getProjects,
    createProject,
    deleteProject,
    register,
    login,
    fetchUser,
    uploadAvatar,
    uploadTaskImage
}
