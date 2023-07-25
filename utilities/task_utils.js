const lodash = require("lodash");

const setTaskID = (projectCode, currentTaskIDs) => {
    let lastTaskID = lodash.last(currentTaskIDs);
    if (lastTaskID) {
        lastTaskID = Number(lastTaskID.slice(lastTaskID.indexOf('-')+1));
        const newTaskID = lastTaskID + 1;
        return `${projectCode}-${newTaskID}`;
    }
    else {
        return `${projectCode}-1`;
    }
}

const setCommentID = currentComments => {
    console.log(currentComments)
    const latestComment = lodash.last(currentComments);
    console.log(latestComment)
    const latestCommentID = latestComment.commentID;
    const incrementedID = Number(latestCommentID.slice(latestCommentID.indexOf('-')+1))++;

    return `comment-${incrementedID}`;
}



module.exports = {
    setTaskID,
    setCommentID
}