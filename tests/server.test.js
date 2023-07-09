const supertest = require("supertest");
const mongoose = require("mongoose");
const fs = require("fs");

const app = require("../server/server");
const Project = require("../server/models/ProjectSchema");
const Task = require("../server/models/TaskSchema");
const User = require("../server/models/UserSchema");

const api = supertest(app);
const bearerToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ik5hdGFsaWUtVGVzdCIsImlhdCI6MTY4ODg3Mzk0OH0.qgnrxTvvhIa13LH2AwNX_lUJD1R5PAwDNRV5Io9deOw'
const newTask = {
    title: 'Task for testing',
    description: 'A task created specifically for testing',
    type: 'task',
    status: 'Backlog',
    project: 'Test Project',
};

beforeAll(async () => {
    const rawData = fs.readFileSync("tests/test_data.json");
    const sampleData = JSON.parse(rawData);

    for (var i = 0; i < sampleData.projects.length; i++) {
        const newProject = new Project(sampleData.projects[i]);
        await newProject.save();
    }
    for (var i = 0; i < sampleData.tasks.length; i++) {
        const newTask = new Task(sampleData.tasks[i]);
        await newTask.save();
    }
    for (var i = 0; i < sampleData.users.length; i++) {
        const newUser = new User(sampleData.users[i]);
        await newUser.save();
    }
});

describe('Index', () => {
    it('should return string', async () => {
        const response = await api.get('/');
        expect(response.statusCode).toEqual(200);
        expect(response.text).toEqual('<h1>Hello World</h1>');
    })
})

describe('Tasks Endpoint', () => {
    it('should return all tasks', async () => {
        const response = await api.get('/api/tasks');
        expect(response.statusCode).toBe(200);
        expect(response.headers['content-type']).toContain('application/json');
        expect(response.body.length).toBe(6);
    });

    it('should return a specific task', async () => {
        const response = await api.get('/api/tasks/RAND-3');
        expect(response.statusCode).toBe(200);
        expect(response.headers['content-type']).toContain('application/json');
        expect(response.body).toMatchObject({
            taskID: "RAND-3",
            title: "Task for testing",
            description: "Investigate something",
            type: "investigation",
            status: "Testing",
            project: "Random Project",
            reporter: "Hayley-Test"
        });
    });

    it('should return tasks in a specific project', async () => {
        const response = await api.get('/api/tasks/project/Random Project');
        expect(response.statusCode).toEqual(200);
        expect(response.body.length).toEqual(4);
    })

    it('should return 404 if task is not found', async () => {
        const response = await api.get('/api/tasks/RAND-52');
        expect(response.statusCode).toBe(404);
    });

    it('should respond with 401 if sending POST request without Authorization', async () => {
        const response = await api.post('/api/tasks').send(newTask);
        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('The request was not completed due to an unauthorised user');
    });

    it('should respond with 401 if sending POST request with invalid Auth', async () => {
        const response = await api.post('/api/tasks')
            .set('Authorization', 'Bearer invalid.token')
            .send(newTask);
        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('The request was not completed due to an unauthorised user');
    })

    it('should respond with 400 if no request body provided but Auth provided', async () => {
        const response = await api.post('/api/tasks')
            .set('Authorization', bearerToken)
        expect(response.statusCode).toEqual(400);
        expect(response.text).toEqual('No Task details were provided');
    });

    it('should create task on POST request', async () => {
        const response = await api.post('/api/tasks')
            .set('Authorization', bearerToken)
            .send(newTask);
        expect(response.statusCode).toEqual(201);
        
        // check that is task is created successfully
        const taskCreated = response.body.task;
        expect(taskCreated.taskID).toEqual('TEST-3');
        expect(taskCreated.reporter).toEqual('Natalie-Test');

        //check that task is added to project
        const projectsResponse = await api.get('/api/projects');
        const project = projectsResponse.body.find(proj => proj.projectName === newTask.project);
        const task = project.tasks[project.tasks.length -1];
        expect(taskCreated.taskID).toEqual(task.taskID);
    });
});

describe('Projects Endpoint', () => {
    it('should return all projects', async () => {
        const response = await api.get('/api/projects');
        expect(response.statusCode).toEqual(200);
        expect(response.body.length).toEqual(2);
    })
})

afterAll(async () => {
    await Project.deleteMany({});
    await Task.deleteMany({});
    await User.deleteMany({});
    mongoose.connection.close();
    app.close();
});