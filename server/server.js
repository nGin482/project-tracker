const express = require("express");
const cors = require("cors");
const multer = require("multer");
const lodash = require("lodash");
require("dotenv").config();

const projectsRoutes = require("./routes/projectsRoutes");
const commentsRouter = require("./routes/commentsRoutes");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

const TaskUtils = require("../utilities/task_utils");
const Utils = require("../utilities/utils");
const mongoConnection = require("./mongo");
const Task = require("./models/TaskSchema");
const User = require("./models/UserSchema");
const Project = require("./models/ProjectSchema");
const uploadHandle = require("./services/fileUploadService");
const Comment = require("./models/CommentsSchema");

const app = express();

const mongo_uri = process.env.NODE_ENV === 'test'
    ? process.env.MONGO_TEST_URI
    : process.env.MONGODB_URI;

mongoConnection(mongo_uri);

app.use(cors());
app.use(express.json());

app.use('/api/projects', projectsRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tasks/:taskID/comment', commentsRouter)
app.use('/api/auth', authRoutes);

app.get('/', (request, response) => {
    response.send('<h1>Hello World</h1>')
})


app.post('/api/upload-avatar', multer().single('avatar'), async (request, response) => {
    const file_upload_buffer = request.file.buffer;
    const fullFileName = request.file.originalname;
    const filenameWithoutExtension = fullFileName.slice(0, fullFileName.lastIndexOf('.'));
    const file_type = fullFileName.slice(fullFileName.lastIndexOf('.'));

    if (!uploadHandle.VALID_FILE_TYPES.includes(file_type)) {
        return response.status(400).send('An invalid file was uploaded')
    }

    try {
        const uploadResult = await uploadHandle.fileUpload(file_upload_buffer, filenameWithoutExtension);
        return response.status(200).send(uploadResult.url);
    }
    catch(error) {
        const responseJSON = {
            message: 'An error occurred when uploading your image, please try again',
            error: error.message
        };
        return response.status(500).json(responseJSON)
    }
})

app.post('/api/task-uploads', multer().single('upload'), async (request, response) => {
    if (!Utils.isAuthorised(request.headers)) {
        return response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to update this task');
    }

    const file_upload_buffer = request.file.buffer;
    const fullFileName = request.file.originalname;
    const filenameWithoutExtension = fullFileName.slice(0, fullFileName.lastIndexOf('.'));
    try {
        const uploadResult = await uploadHandle.fileUpload(file_upload_buffer, filenameWithoutExtension);
        return response.status(200).json({url: uploadResult.url});
    }
    catch(error) {
        const responseJSON = {
            message: 'An error occurred when uploading your image, please try again',
            error: error.message
        };
        return response.status(500).json(responseJSON)
    }
})

app.get('/api/users/:username', async (request, response) => {
    const { username } = request.params;

    const user = await User.findOne({username: username}).populate('tasks').exec();
    if (user) {
        return response.status(200).json(user);
    }
    else {
        return response.status(404).send(`The server cannot find a user with the username ${username}`)
    }
})

const PORT = 3001;
const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})

module.exports = server;