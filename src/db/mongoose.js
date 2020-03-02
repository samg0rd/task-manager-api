const mongoose = require('mongoose');

const connectionURL = process.env.DATABASE_URL;

// connect to the db
mongoose.connect(`${connectionURL}`,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})