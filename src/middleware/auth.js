const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req,res,next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ','');
        const decoded = jwt.verify(token, 'thisIsASecret'); // token - secret | secret must be exact thing we used to generate the token
        const user = await User.findOne({
            _id: decoded._id,
            'tokens.token': token // we wana check that, the token is still part of the tokens array inside user - because when a user loggs out we are gonna delete that token . so we wanna make sure that the user still has a token
        });
               

        if(!user){
            throw new Error();
        }
        
        req.token = token;
        req.user = user; //store user to the request
        
        next();
    } catch (error) {
        res.status(401).send({error: 'Please Authenticate!'})
    }
}

module.exports = auth;