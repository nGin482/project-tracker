const mongoose = require("mongoose");

const url = process.env.MONGODB_URI;

const mongoConnection = () => {
    console.log(`connecting to ${url}`)
    mongoose.connect(url).then(result => {
        console.log('connected to Mongo');
    }).catch(err => {
        console.log('error connecting to Mongo', err.message);
    });
};

module.exports = mongoConnection;