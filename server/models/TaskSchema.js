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
    reporter: String,
    linkedTasks: [{
        type: Schema.Types.ObjectId,
        ref: 'Task'
    }],
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
      delete returnedObject._id;
      delete returnedObject.__v;
    }
});

const Task = model('Task', taskSchema);

module.exports = Task;