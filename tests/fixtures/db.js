const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/User'); 
const Task = require('../../src/models/Task');


const userOneId = new mongoose.Types.ObjectId;
const userOne = {
    _id: userOneId,
    name: 'Mike',
    email: 'mike@example.com',
    password: 'myPass777?',
    tokens: [{
        token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId;
const userTwo = {
    _id: userTwoId,
    name: 'Jax',
    email: 'Jax@example.com',
    password: 'goodFood^213',
    tokens: [{
        token: jwt.sign({_id: userTwoId}, process.env.JWT_SECRET)
    }]
}


const taskOne = {
    _id: new mongoose.Types.ObjectId,
    description: 'First Test Task',
    completed: false,
    owner: userOneId
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId,
    description: 'Second Test Task',
    completed: true,
    owner: userOneId
}

const taskThree = {
    _id: new mongoose.Types.ObjectId,
    description: 'Third Test Task',
    completed: false,
    owner: userTwoId
}


const setupDatabase = async () => {
    await User.deleteMany();
    await Task.deleteMany();
    
    await new User(userOne).save();
    await new User(userTwo).save();

    await new Task(taskOne).save();
    await new Task(taskTwo).save();
    await new Task(taskThree).save();
}

module.exports = {
    userOneId,
    userOne,
    taskOne,
    userTwo,
    setupDatabase,
    taskThree
}