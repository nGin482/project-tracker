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



module.exports = {
    setTaskID
}