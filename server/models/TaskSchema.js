const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const Utils = require("../../utilities/utils");


const taskSchema = new Schema({
    id: String,
    taskID: String,
    title: String,
    description: String,
    project: String,
    type: String,
    status: String,
    created: { 
        type: String,
        default: Utils.createdDate()
    },
    updated: String,
    creator: String,
    comments: [
        {
            comment: String,
            commenter: String,
            date: Date
        }
    ]
});

taskSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject.id
      delete returnedObject.__v
    }
})

const Task = model('Task', taskSchema);

module.exports = Task;