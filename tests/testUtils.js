require("dotenv").config();


const newTask = {
    title: 'Task for testing',
    description: 'A task created specifically for testing',
    type: 'task',
    status: 'Backlog',
    project: 'Test Project',
};

const newTaskWithRelated = {
    title: 'Task for testing',
    description: 'A task created specifically for testing',
    type: 'task',
    status: 'Backlog',
    project: 'Test Project',
    linkedTasks: [
        'RAND-2',
        'RAND-4'
    ]
};

const updatedTask = {
    title: 'Updated Task for testing',
    description: 'A task that is updated to perform some testing',
    type: 'task',
    status: 'Backlog',
    project: 'Test Project',
};

const update = {
    field: 'title',
    value: 'Task for testing something in the Test Project'
};

const linkedTasksEmpty = [];

const linkedTasksDefault = [
    'TEST-1',
    'RAND-2'
];

const linkedTasksBothNotFound = [
    'TEST-57',
    'RAND-58'
];

const linkedTasksOneNotFound = [
    'TEST-3',
    'RAND-58'
];

const newComment = {
    content: 'This is a comment for this task'
};

const newProject = {
    projectCode: 'THIP',
    projectName: 'Third Project'
};

const loginDetailsAlreadyExist = {
    username: 'Natalie-Test',
    password: 'Randompassword'
};

const loginDetailsNew = {
    username: 'New Account',
    password: 'Randompassword',
    email: 'random.email@gmail.com'
};

const loginDetailsFailedUser = {
    username: 'Random Account',
    password: 'Randompassword'
};

const loginDetailsFailedPassword = {
    username: 'New Account',
    password: 'Randompasswod'
}

const loginDetailsSuccess = {
    username: 'New Account',
    password: 'Randompassword'
}

const bearerToken = `Bearer ${process.env.TEST_BEARER_TOKEN}`


module.exports = {
    newTask,
    newTaskWithRelated,
    updatedTask,
    update,
    linkedTasksEmpty,
    linkedTasksDefault,
    linkedTasksBothNotFound,
    linkedTasksOneNotFound,
    newComment,
    newProject,
    loginDetailsAlreadyExist,
    loginDetailsNew,
    loginDetailsFailedUser,
    loginDetailsFailedPassword,
    loginDetailsSuccess,
    bearerToken
}