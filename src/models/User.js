
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Task = require('./Task');

const userSchema  = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,        
        unique: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('email is not valid!');
            }            
        }
    },
    password: {
        type: String,
        required: 'Please Supply A Password',
        trim: true,
        minlength: 6,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('no PASSWORD word allowed!');
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value){
            if(value < 0){
                throw new Error('age must be positive number');
            }
        }
    },
    tokens: [{
        token:{
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
},{
    timestamps: true //anytime we create a new user the user is going to be created with two additional fields - createdAt / updatedAt
})

userSchema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// methods are accessible on the instances (instance methods)
userSchema.methods.generateAuthToken = async function(){    
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET) //payload objet - secret

    //save the user to the database
    user.tokens = user.tokens.concat({token})
    await user.save();

    return token;
}

//in express when ever we user res.send() before sending express calls JSON.stringify()
//and when ever the object that is being sent back is stringified, the toJSON function
//will be called automatically
// and when we 

// limit the data that goes back 
userSchema.methods.toJSON = function(){ //toJSON will be called even when we dont call is manually
    const user = this;
    const userObject = user.toObject(); // .toObject() is provided by mongoose and provides the raw data

    delete userObject.password; //delete is a keyword that helps us delete a peroperty from an object
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}

// static methods are accessible on the model (model methods)
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email});
    if(!user){        
        throw new Error('Unable to login!');        
    }    
    
    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){        
        throw new Error('Unable to login!');
    }    

    return user;
}

//hash the plain text password before saving
userSchema.pre('save', async function(next){
    const user = this; //(this is referes to the user that is about to be created)

    if(user.isModified('password')){ // if password field is being modified (created for the first time or being updated)
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
})

//delete user tasks when the user is removed
userSchema.pre('remove', async function (next) {
    const user = this;

    await Task.deleteMany({ owner: user._id });

    next();
})

// create a model
const User = mongoose.model('User',userSchema);

module.exports = User;