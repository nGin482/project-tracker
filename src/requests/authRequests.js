import axios from "axios";

import { baseURL } from "./config";

const register = newUser => {
    return axios.post(`${baseURL}/auth/register`, newUser).then(response => response.data);
};

const login = (username, password) => {
    return axios.post(`${baseURL}/auth/login`, {username, password}).then(response => response.data);
};

export {
    register,
    login
};