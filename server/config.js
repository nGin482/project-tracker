const NOT_FOUND = {
    PROJECT_NOT_FOUND: 'The server is unable to find this project',
    TASK_NOT_FOUND: 'The server is unable to find this task',
    USER_NOT_FOUND: 'The server is unable to find this user',
    COMMENT_NOT_FOUND: 'The server is unable to find this comment',
    TASKS_TO_LINK: 'The server cannot find the tasks to link',
    ALL_TASKS_TO_LINK: 'The server cannot find all the tasks to link'
};

const UNAUTHORISED_USER = 'This action can only be performed by a logged in user. Please login or create an account to perform this action';

const BAD_REQUEST = {
    INVALID_PROJECT_DETAILS: 'Please provide details of a new project',
    INVAID_TASK_DETAILS: 'Please provide details of the new task',
    NO_TASKS_LINKED: 'Please provide a task to be linked to this one'
};

const FAILED_LOGIN = 'The username or password is incorrect';

const INVALID_REGISTRATION = 'The username is already in use';

const FILE_UPLOAD_FAILED = {
    INVALID_FILE: 'An invalid file was uploaded',
    UPLOAD_ERROR: 'An error occurred when uploading your image, please try again'
};

const SUCCESS = {
    TASK_DELETED: 'The task was successfully deleted',
    COMMENT_DELETED: 'The comment was successfully deleted',
    PROJECT_DELETED: 'The project was successfully deleted'
};


module.exports = {
    NOT_FOUND,
    UNAUTHORISED_USER,
    BAD_REQUEST,
    FAILED_LOGIN,
    INVALID_REGISTRATION,
    FILE_UPLOAD_FAILED,
    SUCCESS
};