const lodash = require("lodash");

const setTaskID = (projectCode, currentTaskIDs) => {
    let lastTaskID = lodash.last(currentTaskIDs);
    lastTaskID = Number(lastTaskID.slice(lastTaskID.indexOf('-')+1))
    const newTaskID = lastTaskID + 1;
    return `${projectCode}-${newTaskID}`
}



module.exports = {
    setTaskID
}