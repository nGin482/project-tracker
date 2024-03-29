import axios from "axios";

import { baseURL, authHeader } from "./config";

const getTasks = () => {
    return axios.get(`${baseURL}/tasks`).then(response => response.data);
};

const getTask = taskID => {
    return axios.get(`${baseURL}/tasks/${taskID}`).then(response => response.data);
};

const getTasksByProject = project => {
    return axios.get(`${baseURL}/tasks/project/${project}`).then(response => response.data);
};

const createTask = (task, token) => {
    return axios.post(`${baseURL}/tasks`, task, authHeader(token)).then(response => response.data);
};

const updateTask = (taskID, newTaskObject, token) => {
    return axios.put(`${baseURL}/tasks/${taskID}`, newTaskObject, authHeader(token)).then(response => response.data);
};

const updateTaskDetail = (taskID, newDetails, token) => {
    return axios.patch(`${baseURL}/tasks/${taskID}`, newDetails, authHeader(token)).then(response => response.data);
};

const linkTasks = (taskID, tasks, token) => {
    return axios.patch(`${baseURL}/tasks/${taskID}/link`, tasks, authHeader(token)).then(response => response.data);
};

const deleteTask = (taskID, token) => {
    return axios.delete(`${baseURL}/tasks/${taskID}`, authHeader(token)).then(response => response.data);
};

export {
    getTasks,
    getTask,
    getTasksByProject,
    createTask,
    updateTask,
    updateTaskDetail,
    linkTasks,
    deleteTask
};