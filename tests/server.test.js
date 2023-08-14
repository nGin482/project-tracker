const supertest = require("supertest");
const mongoose = require("mongoose");
const fs = require("fs");

const app = require("../server/server");
const Project = require("../server/models/ProjectSchema");
const Task = require("../server/models/TaskSchema");
const User = require("../server/models/UserSchema");
const {
    newTask,
    newTaskWithRelated,
    updatedTask,
    update,
    linkedTasksEmpty,
    linkedTasksDefault,
    linkedTasksBothNotFound,
    linkedTasksOneNotFound,
    newProject,
    loginDetailsAlreadyExist,
    loginDetailsNew,
    loginDetailsFailedUser,
    loginDetailsFailedPassword,
    loginDetailsSuccess,
    bearerToken,
    newComment,
} = require("./testUtils");
const Comment = require("../server/models/CommentsSchema");

const api = supertest(app);

beforeAll(async () => {
    const rawData = fs.readFileSync("tests/test_data.json");
    const sampleData = JSON.parse(rawData);

    for (var i = 0; i < sampleData.projects.length; i++) {
        const newProject = new Project(sampleData.projects[i]);
        await newProject.save().then(() => {
            console.log('project saved')
        }).catch(err => {
            console.log(err)
        });
    }
    for (var i = 0; i < sampleData.tasks.length; i++) {
        const newTask = new Task(sampleData.tasks[i]);
        await newTask.save().then(() => {
            console.log('task saved')
        }).catch(err => {
            console.log(err)
        });
    }
    for (var i = 0; i < sampleData.users.length; i++) {
        const newUser = new User(sampleData.users[i]);
        await newUser.save().then(() => {
            console.log('user saved')
        }).catch(err => {
            console.log(err)
        });;
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

    it('should return 404 if project to search tasks by is not provided', async () => {
        const response = await api.get('/api/tasks/project/undefined');
        expect(response.statusCode).toEqual(404);
        expect(response.text).toEqual('Please specify a project to search for');
    });

    it('should return tasks in a specific project', async () => {
        const response = await api.get('/api/tasks/project/Random Project');
        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveLength(4);
    });

    it('should return 404 if task is not found', async () => {
        const response = await api.get('/api/tasks/RAND-52');
        expect(response.statusCode).toBe(404);
    });

    it('should respond with 401 if sending POST request without Authorization', async () => {
        const response = await api.post('/api/tasks').send(newTask);
        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('This action can only be performed by a logged in user. Please login or create an account to perform this action');
    });

    it('should respond with 401 if sending POST request with invalid Auth', async () => {
        const response = await api.post('/api/tasks')
            .set('Authorization', 'Bearer invalid.token')
            .send(newTask);
        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('This action can only be performed by a logged in user. Please login or create an account to perform this action');
    })

    it('should respond with 400 if no request body provided but Auth provided', async () => {
        const response = await api.post('/api/tasks')
            .set('Authorization', bearerToken)
        expect(response.statusCode).toEqual(400);
        expect(response.text).toEqual('Please provide details of the new task');
    });

    it('should create task on POST request', async () => {
        const response = await api.post('/api/tasks')
            .set('Authorization', bearerToken)
            .send(newTask);
        expect(response.statusCode).toEqual(201);
        
        // check that is task is created successfully
        const taskCreated = response.body;
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
        const taskCreated = response.body;
        expect(taskCreated).not.toBeUndefined();
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
        expect(response.text).toEqual('This action can only be performed by a logged in user. Please login or create an account to perform this action');
    });

    it('should respond with 401 if updating task with invalid auth', async () => {
        const response = await api.put('/api/tasks/RAND-1')
            .set('Authorization', 'invalid.token')
            .send(updatedTask);

        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('This action can only be performed by a logged in user. Please login or create an account to perform this action');
    });

    it('should respond with 400 if updating task without updated details sent', async () => {
        const response = await api.put('/api/tasks/RAND-1')
            .set('Authorization', bearerToken);
        
        expect(response.statusCode).toEqual(400);
        expect(response.text).toEqual('Please provide details of the new task');
    });

    it('should respond with 404 if task does not exist to update', async () => {
        const response = await api.put('/api/tasks/BLANK-1')
            .set('Authorization', bearerToken)
            .send(updatedTask);
        
        expect(response.statusCode).toEqual(404);
        expect(response.text).toEqual(`The server is unable to find this task`);
    });

    it('should respond with 200 when successfully updating task', async () => {
        const response = await api.put('/api/tasks/RAND-3')
            .set('Authorization', bearerToken)
            .send(updatedTask);
        
        expect(response.statusCode).toEqual(200);
        expect(response.body).toMatchObject(updatedTask);
    });

    it('UPDATE TASK FIELD - respond with 401 if no auth provided', async () => {
        const response = await api.patch('/api/tasks/TEST-2')
            .send(update);
        
        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('This action can only be performed by a logged in user. Please login or create an account to perform this action');

        const taskResponse = await api.get('/api/tasks/TEST-2');
        const task = taskResponse.body;
        expect(task.title).not.toEqual(update.value);
    });

    it('UPDATE TASK FIELD - respond with 401 if invalid auth provided', async () => {
        const response = await api.patch('/api/tasks/TEST-2')
            .set('Authorization', 'invalid.token')
            .send(update);
        
        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('This action can only be performed by a logged in user. Please login or create an account to perform this action');

        const taskResponse = await api.get('/api/tasks/TEST-2');
        const task = taskResponse.body;
        expect(task.title).not.toEqual(update.value);
    });

    it('UPDATE TASK FIELD - respond with 404 if unable to find task to update', async () => {
        const response = await api.patch('/api/tasks/TESTING-2')
            .set('Authorization', bearerToken)
            .send(update);
        
        expect(response.statusCode).toEqual(404);
        expect(response.text).toEqual('The server is unable to find this task');

        const taskResponse = await api.get('/api/tasks/TESTING-2');
        const task = taskResponse.body;
        expect(task).toStrictEqual({});
    });

    it('UPDATE TASK FIELD - successfully update', async () => {
        const response = await api.patch('/api/tasks/TEST-2')
            .set('Authorization', bearerToken)
            .send(update);
        
        expect(response.statusCode).toEqual(200);

        const taskResponse = await api.get('/api/tasks/TEST-2');
        const task = taskResponse.body;
        expect(task.title).toEqual(update.value);
    });

    it('LINK RELATED TASKS - respond with 401 if no auth provided', async () => {
        const response = await api.patch('/api/tasks/RAND-4/link')
            .send({ linkedTasks: linkedTasksDefault });
        
        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('This action can only be performed by a logged in user. Please login or create an account to perform this action');
        
        const taskResponse = await api.get('/api/tasks/RAND-4');
        const task = taskResponse.body;
        expect(task.linkedTasks).toHaveLength(1);
    });

    it('LINK RELATED TASKS - respond with 401 if invalid auth provided', async () => {
        const response = await api.patch('/api/tasks/RAND-4/link')
            .set('Authorization', 'Bearer invalid.token')
            .send({ linkedTasks: linkedTasksDefault });
        
        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('This action can only be performed by a logged in user. Please login or create an account to perform this action');
        
        const taskResponse = await api.get('/api/tasks/RAND-4');
        const task = taskResponse.body;
        expect(task.linkedTasks).toHaveLength(1);
    });

    it('LINK RELATED TASKS - respond with 400 if request body does not contain linkedTasks key', async () => {
        const response = await api.patch('/api/tasks/RAND-4/link')
            .set('Authorization', bearerToken)
            .send({ linkedTasksDefault });
        
        expect(response.statusCode).toEqual(400);
        expect(response.text).toEqual('Please provide a task to be linked to this one');
        
        const taskResponse = await api.get('/api/tasks/RAND-4');
        const task = taskResponse.body;
        expect(task.linkedTasks).toHaveLength(1);
    });

    it('LINK RELATED TASKS - respond with 400 if linkedTasks array in request body is empty', async () => {
        const response = await api.patch('/api/tasks/RAND-4/link')
            .set('Authorization', bearerToken)
            .send({ linkedTasks: linkedTasksEmpty });
        
        expect(response.statusCode).toEqual(400);
        expect(response.text).toEqual('Please provide a task to be linked to this one');

        const taskResponse = await api.get('/api/tasks/RAND-4');
        const task = taskResponse.body;
        const linkedTasks = task.linkedTasks;
        expect(linkedTasks).toHaveLength(1);
    });

    it('LINK RELATED TASKS - respond with 404 if the task being linked is not found', async () => {
        const response = await api.patch('/api/tasks/RAND-52/link')
            .set('Authorization', bearerToken)
            .send({ linkedTasks: linkedTasksDefault });
        
        expect(response.statusCode).toEqual(404);
        expect(response.text).toEqual('The server is unable to find this task');
        
        const taskResponse = await api.get('/api/tasks');
        const tasks = taskResponse.body;
        expect(tasks).toHaveLength(8);
    });

    it('LINK RELATED TASKS - respond with 404 if none of the task(s) to link can be found', async () => {
        const response = await api.patch('/api/tasks/RAND-4/link')
            .set('Authorization', bearerToken)
            .send({ linkedTasks: linkedTasksBothNotFound });
        
        expect(response.statusCode).toEqual(404);
        expect(response.text).toEqual('The server cannot find the tasks to link');

        const taskResponse = await api.get('/api/tasks/RAND-4');
        const task = taskResponse.body;
        expect(task.linkedTasks).toHaveLength(1);
    });

    it("LINK RELATED TASKS - respond with 404 if one or more of the task(s) to link can't be found", async () => {
        const response = await api.patch('/api/tasks/RAND-4/link')
            .set('Authorization', bearerToken)
            .send({ linkedTasks: linkedTasksOneNotFound });
        
        expect(response.statusCode).toEqual(404);
        expect(response.text).toEqual('The server cannot find all the tasks to link');

        const tasksResponse = await api.get('/api/tasks');
        const tasks = tasksResponse.body;
        expect(tasks).toHaveLength(8);

        const taskResponse = await api.get('/api/tasks/RAND-4');
        const task = taskResponse.body;
        expect(task.linkedTasks).toHaveLength(1);
    });

    it("LINK RELATED TASKS - respond with 200 if able to successfully link all tasks", async () => {
        const response = await api.patch('/api/tasks/RAND-4/link')
            .set('Authorization', bearerToken)
            .send({ linkedTasks: linkedTasksDefault });
        
        expect(response.statusCode).toEqual(200);

        const taskResponse = await api.get('/api/tasks/RAND-4');
        const task = taskResponse.body;
        expect(task.linkedTasks.length).toEqual(linkedTasksDefault.length + 1);
    });

    it("DELETE TASK - respond with 401 if no auth provided", async () => {
        const response = await api.delete('/api/tasks/RAND-4');
        
        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('This action can only be performed by a logged in user. Please login or create an account to perform this action');

        const taskResponse = await api.get('/api/tasks/RAND-4');
        expect(taskResponse.body).toBeDefined();
    });

    it("DELETE TASK - respond with 401 if invalid auth provided", async () => {
        const response = await api.delete('/api/tasks/RAND-4')
            .set('Authorization', 'Bearer invalid.token');
        
        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('This action can only be performed by a logged in user. Please login or create an account to perform this action');

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

describe('Comments Endpoint', () => {
    it('CREATE COMMENT - should return 401 if no auth provided', async () => {
        const response = await api.post('/api/tasks/TEST-2/comment')
            .send({...newComment});

        expect(response.statusCode).toEqual(401);
        expect(response.text).toContain('Please login or create an account to perform this action');
    });

    it('CREATE COMMENT - should return 401 if no auth provided', async () => {
        const response = await api.post('/api/tasks/TEST-2/comment')
            .set('Authorization', 'invalid.token')
            .send({...newComment});

        expect(response.statusCode).toEqual(401);
        expect(response.text).toContain('Please login or create an account to perform this action');
    });

    it('CREATE COMMENT - should return 404 if cannot find the task to comment on', async () => {
        const response = await api.post('/api/tasks/TEST-25/comment')
            .set('Authorization', bearerToken)
            .send({...newComment});

        expect(response.statusCode).toEqual(404);
        expect(response.text).toContain('The server is unable to find this task');
    });

    it('CREATE COMMENT - should return 200 if able to successfully comment on task', async () => {
        const response = await api.post('/api/tasks/TEST-2/comment')
            .set('Authorization', bearerToken)
            .send({...newComment});

        expect(response.statusCode).toEqual(201);

        const taskResponse = await api.get('/api/tasks/TEST-2');
        expect(taskResponse.body).toMatchObject(response.body);
        const comment = taskResponse.body.comments[0];
        expect(comment.content).toContain(newComment.content);

        const userResponse = await api.get('/api/users/Natalie-Test');
        const userComments = userResponse.body.comments;
        expect(userComments).toHaveLength(1);
    });

    it('UPDATE COMMENT - should respond with 401 if no auth provided', async () => {
        const response = await api.patch('/api/tasks/TEST-2/comment/comment-1')
            .send({...newComment});

        expect(response.statusCode).toEqual(401);
        expect(response.text).toContain('Please login or create an account to perform this action');
    });

    it('UPDATE COMMENT - should respond with 401 if invalid auth provided', async () => {
        const response = await api.patch('/api/tasks/TEST-2/comment/comment-1')
            .set('Authorization', 'invalid.token')
            .send({...newComment});

        expect(response.statusCode).toEqual(401);
        expect(response.text).toContain('Please login or create an account to perform this action');
    });

    it('UPDATE COMMENT - should respond with 404 if unable to find the task comment was made on', async () => {
        const response = await api.patch('/api/tasks/TEST-25/comment/comment-1')
            .set('Authorization', bearerToken)
            .send({...newComment});

        expect(response.statusCode).toEqual(404);
        expect(response.text).toContain('The server is unable to find this task');
    });

    it('UPDATE COMMENT - should respond with 404 if unable to find the comment', async () => {
        const response = await api.patch('/api/tasks/TEST-2/comment/comment-15')
            .set('Authorization', bearerToken)
            .send({...newComment});

        expect(response.statusCode).toEqual(404);
        expect(response.text).toContain('The server is unable to find this comment');
    });

    it('UPDATE COMMENT - should respond with 200 if able to update the comment', async () => {
        const response = await api.patch('/api/tasks/TEST-2/comment/comment-1')
            .set('Authorization', bearerToken)
            .send({ content: 'This is an updated comment'});

        expect(response.statusCode).toEqual(200);

        const taskResponse = await api.get('/api/tasks/TEST-2');
        const taskComments = taskResponse.body.comments;
        expect(taskComments[0].content).toEqual('This is an updated comment');
    });

    it('DELETE COMMENT - should respond with 401 if no auth provided', async () => {
        const response = await api.delete('/api/tasks/TEST-2/comment/comment-1');

        expect(response.statusCode).toEqual(401);
        expect(response.text).toContain('Please login or create an account to perform this action');
    });

    it('DELETE COMMENT - should respond with 401 if invalid auth provided', async () => {
        const response = await api.delete('/api/tasks/TEST-2/comment/comment-1')
            .set('Authorization', 'invalid.token');

        expect(response.statusCode).toEqual(401);
        expect(response.text).toContain('Please login or create an account to perform this action');
    });

    it('DELETE COMMENT - should respond with 404 if unable to find the task comment was made on', async () => {
        const response = await api.delete('/api/tasks/TEST-25/comment/comment-1')
            .set('Authorization', bearerToken);

        expect(response.statusCode).toEqual(404);
        expect(response.text).toContain('The server is unable to find this task');
    });

    it('DELETE COMMENT - should respond with 404 if unable to find the comment', async () => {
        const response = await api.delete('/api/tasks/TEST-2/comment/comment-15')
            .set('Authorization', bearerToken);

        expect(response.statusCode).toEqual(404);
        expect(response.text).toContain('The server is unable to find this comment');
    });

    it('DELETE COMMENT - should respond with 200 if able to delete the comment', async () => {
        const response = await api.delete('/api/tasks/TEST-2/comment/comment-1')
            .set('Authorization', bearerToken);

        expect(response.statusCode).toEqual(200);
        
        const taskResponse = await api.get('/api/tasks/TEST-2');
        const taskComments = taskResponse.body.comments;
        expect(taskComments).toHaveLength(0);

        const userResponse = await api.get('/api/users/Natalie-Test');
        const userComments = userResponse.body.comments;
        expect(userComments).toHaveLength(0);
    });
});

describe('Projects Endpoint', () => {
    it('should return all projects', async () => {
        const response = await api.get('/api/projects');
        expect(response.statusCode).toEqual(200);
        expect(response.body.length).toEqual(2);
    });

    it('CREATE PROJECT - should respond with 401 if no auth provided', async () => {
        const response = await api.post('/api/projects')
            .send({ newProject });
        
        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('This action can only be performed by a logged in user. Please login or create an account to perform this action');

        const projectsResponse = await api.get('/api/projects');
        expect(projectsResponse.body).toHaveLength(2);
    });

    it('CREATE PROJECT - should respond with 401 if invalid auth provided', async () => {
        const response = await api.post('/api/projects')
            .set('Authorization', 'Bearer invalid.token')
            .send({ newProject });
        
        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('This action can only be performed by a logged in user. Please login or create an account to perform this action');

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
        const response = await api.post('/api/projects')
            .set('Authorization', bearerToken)
            .send({ ...newProject });
        
        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveProperty('dateCreated');
        expect(response.body).toHaveProperty('tasks');

        const projectsResponse = await api.get('/api/projects');
        expect(projectsResponse.body).toHaveLength(3);
    });

    it('DELETE PROJECT - should respond with 401 if no auth provided', async () => {
        const response = await api.delete('/api/projects/THIP');
        
        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('This action can only be performed by a logged in user. Please login or create an account to perform this action');
        
        const projectsResponse = await api.get('/api/projects');
        expect(projectsResponse.body).toHaveLength(3);
    });

    it('DELETE PROJECT - should respond with 401 if invalid auth provided', async () => {
        const response = await api.delete('/api/projects/THIP')
            .set('Authorization', 'invalid.token');
        
        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('This action can only be performed by a logged in user. Please login or create an account to perform this action');
        
        const projectsResponse = await api.get('/api/projects');
        expect(projectsResponse.body).toHaveLength(3);
    });

    it('DELETE PROJECT - should respond with 404 if cannot find the project to delete', async () => {
        const response = await api.delete('/api/projects/NEW')
            .set('Authorization', bearerToken);
        
        expect(response.statusCode).toEqual(404);
        expect(response.text).toEqual('The server is unable to find this project');
        
        const projectsResponse = await api.get('/api/projects');
        expect(projectsResponse.body).toHaveLength(3);
    });

    it('DELETE PROJECT - should respond with 200 if able to delete the project', async () => {
        const response = await api.delete('/api/projects/THIP')
            .set('Authorization', bearerToken);
        
        expect(response.statusCode).toEqual(200);
        expect(response.text).toEqual('The project was successfully deleted');
        
        const projectsResponse = await api.get('/api/projects');
        expect(projectsResponse.body).toHaveLength(2);
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

describe('Login/Register', () => {
    it('REGISTER - should respond with 409 if username already taken', async () => {
        const response = await api.post('/api/auth/register')
            .send({ ...loginDetailsAlreadyExist });

        expect(response.statusCode).toEqual(409);
        expect(response.text).toEqual('The username is already in use');
    });

    it('REGISTER - should respond with 200 on successful registration', async () => {
        const response = await api.post('/api/auth/register')
            .send({ ...loginDetailsNew });

        expect(response.statusCode).toEqual(200);

        const userResponse = await api.get('/api/users/New account');
        expect(userResponse.body.password).not.toEqual(loginDetailsNew.password);
    });

    it('LOGIN - should respond with 401 if user not found', async () => {
        const response = await api.post('/api/auth/login')
            .send({ ...loginDetailsFailedUser });

        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('The username or password is incorrect');
    });

    it('LOGIN - should respond with 401 if password is incorrect', async () => {
        const response = await api.post('/api/auth/login')
            .send({ ...loginDetailsFailedPassword });

        expect(response.statusCode).toEqual(401);
        expect(response.text).toEqual('The username or password is incorrect');
    });

    it('LOGIN - should respond with 200 on successful login', async () => {
        const response = await api.post('/api/auth/login')
            .send({ ...loginDetailsSuccess });

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveProperty('username');
        expect(response.body).toHaveProperty('token');
    });
});

afterAll(async () => {
    await Project.deleteMany({});
    await Comment.deleteMany({});
    await Task.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
    app.close();
});