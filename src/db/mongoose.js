const mongoose = require('mongoose');

const connectionURL = process.env.DATABASE_URL;
const databaseName = 'task-manager-api';

// connect to the db
mongoose.connect(`${connectionURL}/${databaseName}`,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})