const baseURL = 'http://localhost:3001/api';

const authHeader = token => {
    return {headers: {"Authorization": `Bearer ${token}`}}
};

const formDataHeader = () => {
    return {headers: {"content-type": "multipart/form-data"}}
};

export {
    baseURL,
    authHeader,
    formDataHeader
};