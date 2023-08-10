import axios from "axios";

import { baseURL, authHeader } from "./config";

const commentTask = (taskID, comment, token) => {
    return axios.post(
        `${baseURL}/tasks/${taskID}/comment`,
        { content: comment },
        authHeader(token)
    ).then(response => response.data);
};

const editComment = (taskID, commentID, newContent, token) => {
    return axios.patch(
        `${baseURL}/tasks/${taskID}/comment/${commentID}`,
        { content: newContent },
        authHeader(token)
    ).then(response => response.data);
};

const deleteComment = (taskID, commentID, token) => {
    return axios.delete(
        `${baseURL}/tasks/${taskID}/comment/${commentID}`,
        authHeader(token)
    ).then(response => response.data);
};

export {
    commentTask,
    editComment,
    deleteComment
};