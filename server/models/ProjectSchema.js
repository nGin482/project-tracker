const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const Utils = require("../../utilities/utils");

const ProjectSchema = new Schema({
    projectCode: String,
    projectName: String,
    dateCreated: { 
        type: String,
        default: Utils.createdDate()
    },
    creator: String,
    tasks: [{
        type: Schema.Types.ObjectId,
        ref: 'Task'
    }]
});

const Project = model('Project', ProjectSchema);

module.exports = Project;