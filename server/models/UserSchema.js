const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const Utils = require("../../utilities/utils");

const userSchema = new Schema({
    username: String,
    password: String,
    email: String,
    image: String,
    tasks: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Task'
        }
    ],
    comments: []
});

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      delete returnedObject._id;
      delete returnedObject.__v;
      delete returnedObject.password;
    }
});

const User = model('User', userSchema);

module.exports = User;