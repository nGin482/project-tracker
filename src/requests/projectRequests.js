import axios from "axios";

import { baseURL, authHeader } from "./config";

const getProjects = () => {
    return axios.get(`${baseURL}/projects`).then(response => response.data);
};

const createProject = (project, token) => {
    return axios.post(`${baseURL}/projects`, project, authHeader(token)).then(response => response.data);
};

const deleteProject = (project, token) => {
    return axios.delete(`${baseURL}/projects/${project}`, authHeader(token)).then(response => response.data);
};

export {
    getProjects,
    createProject,
    deleteProject
};