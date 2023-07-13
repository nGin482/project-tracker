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
        expect(response.body).toHaveLength(6);
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
        expect(response.body).toHaveLength(4);
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
        const taskProject = project.tasks[project.tasks.length -1];
        expect(taskCreated.taskID).toEqual(taskProject.taskID);

        //check that task is added to user
        const usersResponse = await api.get(`/api/users/${taskCreated.reporter}`);
        const user = usersResponse.body;
        const taskUser = user.tasks[user.tasks.length -1];
        expect(taskCreated.taskID).toEqual(taskUser.taskID);
    });

    it('should link tasks when data is provided on POST request', async () => {
        const response = await api.post('/api/tasks')
            .set('Authorization', bearerToken)
            .send(newTaskWithRelated);

        expect(response.statusCode).toEqual(201);
        const taskCreated = response.body.task;
        expect(taskCreated.taskID).toEqual('TEST-4');
        expect(taskCreated.reporter).toEqual('Natalie-Test');
        expect(taskCreated.linkedTasks).toHaveLength(2);
        expect(taskCreated.linkedTasks[0]).not.toEqual(newTaskWithRelated.linkedTasks[0]);
        expect(taskCreated.linkedTasks[1]).not.toEqual(newTaskWithRelated.linkedTasks[1]);
    });

    it('should respond with 401 if updating task with no auth', async () => {
        const updatedTask = {
            title: 'Updated Task for testing',
            description: 'A task that is updated to perform some testing',
            type: 'task',
            status: 'Backlog',
            project: 'Test Project',
        };
        
        const response = await api.put('/api/tasks/RAND-1')
            .send(updatedTask);
        
        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('This action can only be performed by a logged in user. Please login or create an account to update this task');
    });

    it('should respond with 401 if updating task with invalid auth', async () => {
        const updatedTask = {
            title: 'Updated Task for testing',
            description: 'A task that is updated to perform some testing',
            type: 'task',
            status: 'Backlog',
            project: 'Test Project',
        };
        
        const response = await api.put('/api/tasks/RAND-1')
            .set('Authorization', 'invalid.token')
            .send(updatedTask);

        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('This action can only be performed by a logged in user. Please login or create an account to update this task');
    });

    it('should respond with 400 if updating task without updated details sent', async () => {
        const response = await api.put('/api/tasks/RAND-1')
            .set('Authorization', bearerToken);
        
        expect(response.statusCode).toEqual(400);
        expect(response.text).toEqual('No Task details were provided');
    });

    it('should respond with 404 if task does not exist to update', async () => {
        const updatedTask = {
            title: 'Updated Task for testing',
            description: 'A task that is updated to perform some testing',
            type: 'task',
            status: 'Backlog',
            project: 'Test Project',
        };
        const response = await api.put('/api/tasks/BLANK-1')
            .set('Authorization', bearerToken)
            .send(updatedTask);
        
        expect(response.statusCode).toEqual(404);
        expect(response.text).toEqual(`Unable to find a task with ID BLANK-1`);
    });

    it('should respond with 200 when successfully updating task', async () => {
        const updatedTask = {
            title: 'Updated Task for testing',
            description: 'A task that is updated to perform some testing',
            type: 'task',
            status: 'Backlog',
            project: 'Test Project',
        };
        const response = await api.put('/api/tasks/RAND-3')
            .set('Authorization', bearerToken)
            .send(updatedTask);
        
        expect(response.statusCode).toEqual(200);
        expect(response.body).toMatchObject(updatedTask);
    });

    it('UPDATE TASK FIELD - respond with 401 if no auth provided', async () => {
        const update = {
            field: 'title',
            value: 'Task for testing something in the Test Project'
        }
        const response = await api.patch('/api/tasks/TEST-2')
            .send(update);
        
        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('This action can only be performed by a logged in user. Please login or create an account to update this task');

        const taskResponse = await api.get('/api/tasks/TEST-2');
        const task = taskResponse.body;
        expect(task.title).not.toEqual(update.value);
    });

    it('UPDATE TASK FIELD - respond with 401 if invalid auth provided', async () => {
        const update = {
            field: 'title',
            value: 'Task for testing something in the Test Project'
        }
        const response = await api.patch('/api/tasks/TEST-2')
            .set('Authorization', 'invalid.token')
            .send(update);
        
        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('This action can only be performed by a logged in user. Please login or create an account to update this task');

        const taskResponse = await api.get('/api/tasks/TEST-2');
        const task = taskResponse.body;
        expect(task.title).not.toEqual(update.value);
    });

    it('UPDATE TASK FIELD - respond with 404 if unable to find task to update', async () => {
        const update = {
            field: 'title',
            value: 'Task for testing something in the Test Project'
        }
        const response = await api.patch('/api/tasks/TESTING-2')
            .set('Authorization', bearerToken)
            .send(update);
        
        expect(response.statusCode).toEqual(404);
        expect(response.text).toEqual('Unable to find a task with ID TESTING-2');

        const taskResponse = await api.get('/api/tasks/TESTING-2');
        const task = taskResponse.body;
        expect(task).toStrictEqual({});
    });

    it('UPDATE TASK FIELD - successfully update', async () => {
        const update = {
            field: 'title',
            value: 'Task for testing something in the Test Project'
        }
        const response = await api.patch('/api/tasks/TEST-2')
            .set('Authorization', bearerToken)
            .send(update);
        
        expect(response.statusCode).toEqual(200);

        const taskResponse = await api.get('/api/tasks/TEST-2');
        const task = taskResponse.body;
        expect(task.title).toEqual(update.value);
    });

    it('LINK RELATED TASKS - respond with 401 if no auth provided', async () => {
        const linkedTasks = [
            'TEST-1',
            'RAND-2'
        ];
        const response = await api.patch('/api/tasks/RAND-4/link')
            .send({ linkedTasks });
        
        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('This action can only be performed by a logged in user. Please login or create an account to update this task');

        const taskResponse = await api.get('/api/tasks/RAND-4');
        const task = taskResponse.body;
        expect(task.linkedTasks).toHaveLength(0);
    });

    it('LINK RELATED TASKS - respond with 401 if invalid auth provided', async () => {
        const linkedTasks = [
            'TEST-1',
            'RAND-2'
        ];
        const response = await api.patch('/api/tasks/RAND-4/link')
            .set('Authorization', 'Bearer invalid.token')
            .send({ linkedTasks });
        
        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('This action can only be performed by a logged in user. Please login or create an account to update this task');

        const taskResponse = await api.get('/api/tasks/RAND-4');
        const task = taskResponse.body;
        expect(task.linkedTasks).toHaveLength(0);
    });

    it('LINK RELATED TASKS - respond with 400 if request body does not contain linkedTasks key', async () => {
        const someKey = [
            'TEST-1',
            'RAND-2'
        ];
        const response = await api.patch('/api/tasks/RAND-4/link')
            .set('Authorization', bearerToken)
            .send({ someKey });
        
        expect(response.statusCode).toEqual(400);
        expect(response.text).toEqual('The request was sent without data. Please ensure that tasks are selected to be linked');

        const taskResponse = await api.get('/api/tasks/RAND-4');
        const task = taskResponse.body;
        expect(task.linkedTasks).toHaveLength(0);
    });

    it('LINK RELATED TASKS - respond with 400 if linkedTasks array in request body is empty', async () => {
        const linkedTasks = [];
        const response = await api.patch('/api/tasks/RAND-4/link')
            .set('Authorization', bearerToken)
            .send({ linkedTasks });
        
        expect(response.statusCode).toEqual(400);
        expect(response.text).toEqual('The request was sent without data. Please ensure that tasks are selected to be linked');

        const taskResponse = await api.get('/api/tasks/RAND-4');
        const task = taskResponse.body;
        expect(task.linkedTasks).toHaveLength(0);
    });

    it('LINK RELATED TASKS - respond with 404 if the task being linked is not found', async () => {
        const linkedTasks = [
            'TEST-1',
            'RAND-2'
        ];
        const response = await api.patch('/api/tasks/RAND-52/link')
            .set('Authorization', bearerToken)
            .send({ linkedTasks });
        
        expect(response.statusCode).toEqual(404);
        expect(response.text).toEqual('The server cannot link these tasks together as the task being linked does not exist');

        const taskResponse = await api.get('/api/tasks');
        const tasks = taskResponse.body;
        expect(tasks).toHaveLength(8);
    });

    it('LINK RELATED TASKS - respond with 404 if none of the task(s) to link can be found', async () => {
        const linkedTasks = [
            'TEST-57',
            'RAND-58'
        ];
        const response = await api.patch('/api/tasks/RAND-4/link')
            .set('Authorization', bearerToken)
            .send({ linkedTasks });
        
        expect(response.statusCode).toEqual(404);
        expect(response.text).toEqual('The server cannot find the tasks to link');

        const taskResponse = await api.get('/api/tasks');
        const tasks = taskResponse.body;
        expect(tasks).toHaveLength(8);
    });

    it("LINK RELATED TASKS - respond with 404 if one or more of the task(s) to link can't be found", async () => {
        const linkedTasks = [
            'TEST-3',
            'RAND-58'
        ];
        const response = await api.patch('/api/tasks/RAND-4/link')
            .set('Authorization', bearerToken)
            .send({ linkedTasks });
        
        expect(response.statusCode).toEqual(404);
        expect(response.text).toEqual('The server cannot find all the tasks to link');

        const tasksResponse = await api.get('/api/tasks');
        const tasks = tasksResponse.body;
        expect(tasks).toHaveLength(8);

        const taskResponse = await api.get('/api/tasks/RAND-4');
        const task = taskResponse.body;
        expect(task.linkedTasks).toHaveLength(0);
    });

    it("LINK RELATED TASKS - respond with 200 if able to successfully link all tasks", async () => {
        const linkedTasks = [
            'TEST-3',
            'RAND-2'
        ];
        const response = await api.patch('/api/tasks/RAND-4/link')
            .set('Authorization', bearerToken)
            .send({ linkedTasks });
        
        expect(response.statusCode).toEqual(200);

        const taskResponse = await api.get('/api/tasks/RAND-4');
        const task = taskResponse.body;
        expect(task.linkedTasks).toHaveLength(linkedTasks.length);
    });

    it("DELETE TASK - respond with 401 if no auth provided", async () => {
        const response = await api.delete('/api/tasks/RAND-4');
        
        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('This action can only be performed by a logged in user. Please login or create an account to update this task');

        const taskResponse = await api.get('/api/tasks/RAND-4');
        expect(taskResponse.body).toBeDefined();
    });

    it("DELETE TASK - respond with 401 if invalid auth provided", async () => {
        const response = await api.delete('/api/tasks/RAND-4')
            .set('Authorization', 'Bearer invalid.token');
        
        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('This action can only be performed by a logged in user. Please login or create an account to update this task');

        const taskResponse = await api.get('/api/tasks/RAND-4');
        expect(taskResponse.body).toBeDefined();
    });

    it("DELETE TASK - respond with 400 if no task provided to delete", async () => {
        const response = await api.delete('/api/tasks/')
            .set('Authorization', bearerToken);
        
        expect(response.statusCode).toEqual(404);

        const taskResponse = await api.get('/api/tasks/RAND-4');
        expect(taskResponse.body).toBeDefined();
    });

    it("DELETE TASK - respond with 404 if can't find the task to delete", async () => {
        const response = await api.delete('/api/tasks/RAND-58')
            .set('Authorization', bearerToken);
        
        expect(response.statusCode).toEqual(404);

        const taskResponse = await api.get('/api/tasks');
        expect(taskResponse.body).toHaveLength(8);
    });

    it("DELETE TASK - respond with 200 if successfully deleting task", async () => {
        const response = await api.delete('/api/tasks/RAND-4')
            .set('Authorization', bearerToken);
        
        expect(response.statusCode).toEqual(200);

        const taskResponse = await api.get('/api/tasks/RAND-4');
        expect(taskResponse.statusCode).toEqual(404);
    });
});

describe('Projects Endpoint', () => {
    it('should return all projects', async () => {
        const response = await api.get('/api/projects');
        expect(response.statusCode).toEqual(200);
        expect(response.body.length).toEqual(2);
    });

    it('CREATE PROJECT - should respond with 401 if no auth provided', async () => {
        const newProject = {
            projectCode: 'THIP',
            projectName: 'Third Project'
        }
        const response = await api.post('/api/projects')
            .send({ newProject });
        
        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('This action can only be performed by a logged in user. Please login or create an account to update this task');

        const projectsResponse = await api.get('/api/projects');
        expect(projectsResponse.body).toHaveLength(2);
    });

    it('CREATE PROJECT - should respond with 401 if invalid auth provided', async () => {
        const newProject = {
            projectCode: 'THIP',
            projectName: 'Third Project'
        }
        const response = await api.post('/api/projects')
            .set('Authorization', 'Bearer invalid.token')
            .send({ newProject });
        
        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('This action can only be performed by a logged in user. Please login or create an account to update this task');

        const projectsResponse = await api.get('/api/projects');
        expect(projectsResponse.body).toHaveLength(2);
    });

    it('CREATE PROJECT - should respond with 400 if no project provided', async () => {
        const response = await api.post('/api/projects')
            .set('Authorization', bearerToken);
        
        expect(response.statusCode).toEqual(400);
        expect(response.text).toEqual('Please provide details of a new project');

        const projectsResponse = await api.get('/api/projects');
        expect(projectsResponse.body).toHaveLength(2);
    });

    it('CREATE PROJECT - should respond with 200 if successfully creating a project', async () => {
        const newProject = {
            projectCode: 'THIP',
            projectName: 'Third Project'
        }
        const response = await api.post('/api/projects')
            .set('Authorization', bearerToken)
            .send({ newProject });
        
        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveProperty('dateCreated');
        expect(response.body).toHaveProperty('tasks');

        const projectsResponse = await api.get('/api/projects');
        expect(projectsResponse.body).toHaveLength(3);
    });
});

describe('Users Endpoint', () => {
    it('should return a user if found', async () => {
        const response = await api.get('/api/users/Natalie-Test');
        expect(response.statusCode).toEqual(200);

        const user = response.body;
        expect(user.username).toEqual('Natalie-Test');
        expect(user.tasks.length).toBeGreaterThan(0);
    });

    it('should return 404 if user not found', async () => {
        const response = await api.get('/api/users/some-random-person');
        expect(response.statusCode).toEqual(404);
    });
});

afterAll(async () => {
    await Project.deleteMany({});
    await Task.deleteMany({});
    await User.deleteMany({});
    mongoose.connection.close();
    app.close();
});