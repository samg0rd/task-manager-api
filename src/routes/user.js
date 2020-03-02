const express = require('express');
const router = express.Router();
const User = require('../models/User');
// middlewares
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');

// module
const { sendWelcomeEmail, sendUserCancelationEmail } = require('../emails/account');

// sign up - create user
router.post('/users', async (req,res)=>{
    try {
        const user = new User(req.body);   
        const token = await user.generateAuthToken();     

        await user.save();  

        sendWelcomeEmail(user.email,user.name);

        res.status(201).send({
            user,
            token
        });

    } catch (error) {
        // console.log('❌ERRR -> ', error);        
        res.status(400).send(error);
    }    
})

//log user in (login)
router.post('/users/login', async(req,res)=>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({
            user,
            token
        });
    } catch (error) {
        res.status(400).send(error);
    }
})

//logout (only the one session that is logged in)
router.post('/users/logout', auth, async(req,res)=>{
    try {
        console.log('user 😎 -> ', req.user);
        
        req.user.tokens = req.user.tokens.filter(token =>{
            return token.token !== req.token
        })

        await req.user.save();

        res.send();
    } catch (error) {            
        res.status(500).send(error);
    }
})

//logout from all sessions
router.post('/users/logoutAll', auth, async (req,res)=>{
    try {
        req.user.tokens = [];
        await req.user.save()

        res.send();
    } catch (error) {
        res.status(500).send(error);
    }
})

// get all the users
router.get('/users/me', auth, async (req,res)=>{    
    res.send(req.user);
})

// patch : update an existing document
router.patch('/users/me', auth, async (req,res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name','email','password','age'];
    const isValid = updates.every(update =>  allowedUpdates.includes(update));

    if(!isValid){
        return res.status(400).send({
            error: 'invalid updates!'
        });
    }    
    
    try {        
        updates.forEach(update => req.user[update] = req.body[update]) //update the user
        await req.user.save() //update the user        

        res.send(req.user);

    } catch (error) {
        res.status(400).send(error); 
    }
})


router.delete('/users/me', auth, async (req,res)=>{
    try {        
        await req.user.remove();
        sendUserCancelationEmail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (error) {
        console.log('error 🤔', error);
        res.status(500).send(error);
    }
})

// user upload a profile pic 
const upload = multer({
    // dest: 'avatars', dest will allow us to save the file in the file system - we dont want that though
    limits: {
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            cb(new Error('file must be either jpg, jpeg or png'));
        }
        cb(undefined,true);
    }
})

// cb(new Error('file must be a PDF')); // there is an error (cb = callback)
// cb(undefined, true); // there is no error
// cb(undefined, false); //reject the upload

router.post('/users/me/avatar',  auth, upload.single('avatar'), async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
    req.user.avatar = buffer // data is accessible through req.file

    await req.user.save();
    res.status(200).send();
},(error,req,res,next)=>{
    res.status(400).send({error: error.message})
})


// delete user avatar
router.delete('/users/me/avatar', auth, async (req,res)=>{
    req.user.avatar = undefined;
    await req.user.save();
    res.status(200).send();
})

//fetchin an avatar

router.get('/users/:id/avatar', async (req,res)=>{
    try {
        const user = await User.findById(req.params.id)
        
        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type','image/png') //res.set -> set response header (key - value pairs)

        res.send(user.avatar);

    } catch (error) {
        res.statusZ(404).send();
    }
})

module.exports = router;