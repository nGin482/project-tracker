const express = require("express");
const cors = require("cors");
require("dotenv").config();

const projectsRoutes = require("./routes/projectsRoutes");
const commentsRouter = require("./routes/commentsRoutes");
const uploadRouter = require("./routes/uploadRoutes");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRouter = require("./routes/userRoutes");

const mongoConnection = require("./mongo");

const app = express();

const mongo_uri = process.env.NODE_ENV === 'test'
    ? process.env.MONGO_TEST_URI
    : process.env.MONGODB_URI;

mongoConnection(mongo_uri);

app.use(cors());
app.use(express.json());

app.use('/api/projects', projectsRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tasks/:taskID/comment', commentsRouter);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRouter);
app.use('/api/uploads', uploadRouter);

app.get('/', (request, response) => {
    response.send('<h1>Hello World</h1>')
})

const PORT = 3001;
const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})

module.exports = server;