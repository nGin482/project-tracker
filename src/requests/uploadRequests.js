import axios from "axios";

import { baseURL, authHeader, formDataHeader } from "./config";

const uploadAvatar = file => {
    return axios.post(`${baseURL}uploads/avatar`, file, formDataHeader()).then(response => response.data);
};

const uploadTaskImage = (file, token) => {
    return axios.post(`${baseURL}uploads/task-image`, file, authHeader(token)).then(response => response.data);
};

export {
    uploadAvatar,
    uploadTaskImage
};