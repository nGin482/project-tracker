import { useState } from "react";

import { updateTask } from "../services/requests";

const useTaskStatus = status => {
    const [taskStatus, setTaskStatus] = useState(status);

    const changeStatus = (taskID, newStatus) => {
        setTaskStatus(newStatus);
        updateTask(taskID, {field: 'status', value: newStatus});
    };

    return {
        taskStatus,
        changeStatus
    };
};

export default useTaskStatus;