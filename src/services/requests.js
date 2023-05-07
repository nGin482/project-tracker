import axios from "axios";

const baseURL = 'http://localhost:3001/api/'


const getTasks = () => {
    return axios.get(`${baseURL}tasks`).then(response => response.data);
}
const getTask = taskID => {
    return axios.get(`${baseURL}tasks/${taskID}`).then(response => response.data);
}
const getTasksByProject = project => {
    return axios.get(`${baseURL}tasks/project/${project}`).then(response => response.data);
}
const createTask = task => {
    return axios.post(`${baseURL}tasks`, task).then(response => response.data);
}


export {
    getTasks,
    getTask,
    getTasksByProject,
    createTask
}
