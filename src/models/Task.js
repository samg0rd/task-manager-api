const mongoose = require('mongoose');


const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        trim: true,
        required: 'please supply a task'
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
},{
    timestamps: true
})


taskSchema.pre('save',async function(next){
    const task = this;
    // console.log('pre task saved middleware!');
    next();
})

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;