import { useState, useContext } from "react";

import UserContext from "../contexts/UserContext";
import { updateTask } from "../services/requests";

const useTaskStatus = status => {
    const [taskStatus, setTaskStatus] = useState(status);
    const { user } = useContext(UserContext);

    const changeStatus = (taskID, newStatus) => {
        return updateTask(taskID, {field: 'status', value: newStatus}, user.token).then(() => {
            setTaskStatus(newStatus);
            return Promise.resolve();
        }).catch(err => {
            return Promise.reject(err);
        });
    };

    return {
        taskStatus,
        changeStatus
    };
};

export default useTaskStatus;