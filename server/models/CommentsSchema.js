const mongoose = require("mongoose");

const Utils = require("../../utilities/utils");


const { model, Schema} = mongoose;

const commentSchema = new Schema({
    commentID: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    commenter: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    task: {
        type: Schema.Types.ObjectId,
        ref: 'Task'
    },
    commentDate: {
        type: String,
        default: Utils.createdDate()
    }
});

commentSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      delete returnedObject._id;
      delete returnedObject.__v;
      delete returnedObject.task;
    }
});

const Comment = model('Comment', commentSchema);

module.exports = Comment;