const express = require("express");

const Task = require("../models/TaskSchema");
const User = require("../models/UserSchema");
const Comment = require("../models/CommentsSchema");
const Utils = require("../../utilities/utils");
const TaskUtils = require("../../utilities/task_utils");
const responseMessages = require("../config");

const commentsRouter = express.Router({mergeParams: true});

commentsRouter.post('/', async (request, response) => {
    const isAuthorisedUser = Utils.isAuthorised(request.headers)
    if (!isAuthorisedUser) {
        return response.status(401).send(responseMessages.UNAUTHORISED_USER);
    }

    const { taskID } = request.params;
    const task = await Task.findOne({taskID: taskID});
    if (!task) {
        return response.status(404).send(responseMessages.NOT_FOUND.TASK_NOT_FOUND);
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
        return response.status(401).send(responseMessages.UNAUTHORISED_USER);
    }
    
    const { taskID, commentID} = request.params;

    const task = await Task.findOne({taskID: taskID});
    if (!task) {
        return response.status(404).send(responseMessages.NOT_FOUND.TASK_NOT_FOUND);
    }
    const comment = await Comment.findOne({commentID: commentID});
    if (!comment) {
        return response.status(404).send(responseMessages.NOT_FOUND.COMMENT_NOT_FOUND);
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
        return response.status(401).send(responseMessages.UNAUTHORISED_USER);
    }

    const { taskID, commentID } = request.params;

    const task = await Task.findOne({taskID: taskID});
    if (!task) {
        return response.status(404).send(responseMessages.NOT_FOUND.TASK_NOT_FOUND);
    }

    const comment = await Comment.findOne({commentID: commentID});
    if (!comment) {
        return response.status(404).send(responseMessages.NOT_FOUND.COMMENT_NOT_FOUND);
    }

    const user = await User.findOne({username: isAuthorisedUser.username});
    const updatedUserComments = user.comments.filter(comment => comment !== comment._id);
    user.set('comments', updatedUserComments);
    await user.save();

    const updatedTaskComments = task.comments.filter(comment => comment !== comment._id);
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
    return response.status(200).json({message: responseMessages.SUCCESS.COMMENT_DELETED, task});
});

module.exports = commentsRouter;