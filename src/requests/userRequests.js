import axios from "axios";

import { baseURL } from "./config";

const fetchUser = username => {
    return axios.get(`${baseURL}/users/${username}`).then(response => response.data);
};

export {
    fetchUser
}