const lodash = require("lodash");

const setTaskID = (projectCode, currentTaskIDs) => {
    if (currentTaskIDs.length === 0) {
        return `${projectCode}-1`;
    }
    let lastTaskID = lodash.last(currentTaskIDs);
    lastTaskID = Number(lastTaskID.slice(lastTaskID.indexOf('-')+1));
    const newTaskID = lastTaskID + 1;
    return `${projectCode}-${newTaskID}`;
};

const setCommentID = currentComments => {
    if (currentComments.length === 0) {
        return `comment-1`;
    }
    const latestComment = lodash.last(currentComments);
    const latestCommentID = latestComment.commentID;
    let commentID = Number(latestCommentID.slice(latestCommentID.indexOf('-')+1));
    commentID = commentID + 1;

    return `comment-${commentID}`;
};



module.exports = {
    setTaskID,
    setCommentID
}