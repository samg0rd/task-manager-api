const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth')


router.post('/tasks', auth, async (req,res)=>{
    try {        
        const task = new Task({
            ...req.body,
            owner: req.user._id
        });

        await task.save();
        res.status(201).send(task);

    } catch (error) {
        res.status(400).send(error);
    }
})

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=0 (limit & skip)
// GET /tasks?sortBy=createdAt_asc (field we are trying to sort by and order (ascending or descending))
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req,res)=>{
    try {

        const match = {}
        if(req.query.completed){
            match.completed = req.query.completed === 'true'
        }

        if(req.query.completed === false){
            match.notCompleted = req.query.completed === 'false'
        }

        const sort = {}
        if(req.query.sortBy){
            const parts = req.query.sortBy.split(':');
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        }
        

        /**
         * method 1
        */
        // const tasks = await Task.find({
        //     owner: req.user._id
        // });
        // res.status(200).send(tasks);
        
        /**
         * method 2
        */
        // await req.user.populate('tasks').execPopulate();        
        // res.status(200).send(req.user.tasks);


        /**
         * filtering the returning data
         */
        await req.user.populate({
            path: 'tasks', //what to populate            
            match,
            options: { //pagination and sorting
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();        
        res.status(200).send(req.user.tasks);

        
    } catch (error) {
        res.status(500).send(error);
    }
})

router.get('/tasks/:id', auth, async (req,res)=>{
    try {
        const _id = req.params.id;
        
        const task = await Task.findOne({
            _id,
            owner: req.user._id
        })

        if(!task){
            return res.status(404).send();
        }
        res.status(200).send(task);
    } catch (error) {
        res.status(500).send(error);
    }
})

router.patch('/tasks/:id', auth, async (req,res) => {
    const updates = Object.keys(req.body);
    const validUpdates = ['description','completed'];
    const isVaidUpdate = updates.every(update => validUpdates.includes(update));

    if(!isVaidUpdate){
        return res.status(400).send({
            error: 'update inavalid!'
        })
    }

    try {

        // const task = await Task.findByIdAndUpdate(req.params.id,req.body,{
        //     new: true,
        //     runValidators: true
        // });
        // const task = await Task.findById(req.params.id);
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if(!task){
            return res.status(404).send();
        }

        updates.forEach(update => task[update] = req.body[update]);
        await task.save();
        
        res.status(200).send(task);

    } catch (error) {

        res.status(400).send(error)
    }
})

router.delete('/tasks/:id', auth, async (req,res)=>{
    try {
        //const task = await Task.findByIdAndDelete(req.params.id);
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        })
        if(!task){
            return res.status(404).send();
        }
        res.send(task);
    } catch (error) {
        res.status(500).send(error);
    }
})

module.exports = router;