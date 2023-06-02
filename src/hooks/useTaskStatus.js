import { useState } from "react";


const useTaskStatus = status => {
    const [taskStatus, setTaskStatus] = useState(status);

    const changeStatus = newStatus => {
        setTaskStatus(newStatus);
    };

    return {
        taskStatus,
        changeStatus
    };
};

export default useTaskStatus;