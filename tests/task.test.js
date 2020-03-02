const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/Task');
const {userOneId, userOne, userTwo, setupDatabase, taskOne, taskThree} = require('./fixtures/db')

beforeEach(setupDatabase); 

test('should create task for user', async ()=>{
    //make sure the request will be sent and the response is as expected
    const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        description: 'From my test'
    })
    .expect(201);                    

    //make sure the taks has been created and is in there in the database
    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toEqual(false);
})

test('should get all tasks for a user', async () => {
    const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .expect(200);


    // console.log('🧿🧿🧿 -> ', response.body);
    // check the length of the response to be twp
    expect(response.body.length).toEqual(2);
})

test('should not delete other users task', async () => {
    const response = await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()    
    .expect(404)

    // check if the task is there
    const task = await Task.findById(taskOne._id);
    expect(task).not.toBeNull();
})

test('Should not create task with invalid description/completed', async () => {
    await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        description: ''
    })
    .expect(400);
})

test('Should not update task with invalid description/completed', async () => {
    await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        description: ''
    })
    .expect(400);
})

test('Should delete user task', async () => {
    await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .expect(200);

    const task = await Task.findById(taskOne._id);
    expect(task).toBeNull();
})

test('Should not delete task if unauthenticated', async () => {
    await request(app)
    .delete(`/tasks/${taskOne._id}`)    
    .expect(401);
})

test('Should not update other users task', async () => {
    await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send({
        description: 'booogh'
    })
    .expect(404);

    const task = await Task.findById(taskOne._id);        
    expect(task.description).not.toEqual('booogh');
})

test('Should fetch user task by id', async () => {
    const response = await request(app)
    .get(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .expect(200);
    
    expect(response.body.description).toEqual('First Test Task');
})

test('Should not fetch user task by id if unauthenticated', async () => {
    await request(app)
    .get(`/tasks/${taskOne._id}`)    
    .expect(401);
})

test('Should not fetch other users task by id', async () => {
    await request(app)
    .get(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .expect(404);
})

test('Should fetch only completed tasks', async () => {
    const response = await request(app)
    .get('/tasks?completed=true')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .expect(200);
    
    // can write assertions too to check tasks comming back are all completed true
})

test('Should fetch only incomplete tasks', async () => {
    const response = await request(app)
    .get('/tasks?completed=false')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .expect(200);

    // can write assertions too to check tasks comming back are all completed false
})

test('Should sort tasks by description/completed/createdAt/updatedAt', async () => {
    const response = await request(app)
    .get('/tasks?sortBy=createdAt_asc')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .expect(200);
})

test('Should fetch page of tasks', async () => {
    const response = await request(app)
    .get('/tasks?limit=10&skip=0')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .expect(200);    
})