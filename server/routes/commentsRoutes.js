const express = require("express");

const Task = require("../models/TaskSchema");
const User = require("../models/UserSchema");
const Comment = require("../models/CommentsSchema");
const Utils = require("../../utilities/utils");
const TaskUtils = require("../../utilities/task_utils");

const commentsRouter = express.Router({mergeParams: true});

commentsRouter.post('/', async (request, response) => {
    const isAuthorisedUser = Utils.isAuthorised(request.headers)
    if (!isAuthorisedUser) {
        return response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to update this task');
    }

    const { taskID } = request.params;
    const task = await Task.findOne({taskID: taskID});
    if (!task) {
        return response.status(404).send('The server is unable to find the task to comment on');
    }

    const allComments = await Comment.find({});
    const comment = new Comment({
        commentID: TaskUtils.setCommentID(allComments),
        ...request.body,
        commenter: isAuthorisedUser.id,
        task: task._id
    });
    const savedComment = await comment.save();

    task.comments = task.comments.concat(savedComment._id);
    await task.save();

    await Task.populate(task, 'linkedTasks')
    await Task.populate(task, {
        path: 'comments',
        populate: {
            path: 'commenter',
            select: 'username'
        }
    });

    // add to user's comments
    const user = await User.findOne({username: isAuthorisedUser.username});
    user.comments = user.comments.concat(savedComment._id);
    await user.save();

    return response.status(201).json(task);
});

commentsRouter.patch('/:commentID', async (request, response) => {
    const isAuthorisedUser = Utils.isAuthorised(request.headers)
    if (!isAuthorisedUser) {
        return response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to update this task');
    }
    
    const { taskID, commentID} = request.params;

    const task = await Task.findOne({taskID: taskID});
    if (!task) {
        return response.status(404).send('The task you were looking for does not exist');
    }
    const comment = await Comment.findOne({commentID: commentID});
    if (!comment) {
        return response.status(404).send('The comment you were looking for does not exist');
    }
    comment.set('content', request.body.content);
    await comment.save();

    await Task.populate(task, 'linkedTasks')
    await Task.populate(task, {
        path: 'comments',
        populate: {
            path: 'commenter',
            select: 'username'
        }
    });
    return response.status(200).json(task);
});

commentsRouter.delete('/:commentID', async (request, response) => {
    const isAuthorisedUser = Utils.isAuthorised(request.headers)
    if (!isAuthorisedUser) {
        return response.status(401).send('This action can only be performed by a logged in user. Please login or create an account to update this task');
    }

    const { taskID, commentID } = request.params;

    const task = await Task.findOne({taskID: taskID});
    if (!task) {
        return response.status(404).send('The task you were looking for does not exist');
    }

    const comment = await Comment.findOne({commentID: commentID});
    if (!comment) {
        return response.status(404).send('The comment you were looking for does not exist');
    }

    const user = await User.findOne({username: isAuthorisedUser.username});
    const updatedUserComments = user.comments.filter(comment => comment.commentID !== commentID);
    user.set('comments', updatedUserComments);
    await user.save();

    const updatedTaskComments = task.comments.filter(comment => comment.commentID !== commentID);
    task.set('comments', updatedTaskComments);
    await task.save();

    await Comment.findOneAndDelete({commentID: commentID});
    await Task.populate(task, 'linkedTasks')
    await Task.populate(task, {
        path: 'comments',
        populate: {
            path: 'commenter',
            select: 'username'
        }
    });
    return response.status(200).json({message: 'The comment was successfully deleted', task});
});

module.exports = commentsRouter;