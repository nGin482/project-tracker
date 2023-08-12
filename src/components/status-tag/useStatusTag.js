import { useState, useEffect, useContext } from "react";
import { message } from "antd";

import UserContext from "../../contexts/UserContext";
import useProjects from "../../hooks/useProjects";
import { updateTaskDetail } from "../../requests/taskRequests";

const useStatusTag = status => {
    const [taskStatus, setTaskStatus] = useState(status);
    const [colour, setColour] = useState('#A0A0A0');
    const [messageApi, contextHolder] = message.useMessage();
    
    const { updateTaskStatus } = useProjects();
    const { user } = useContext(UserContext);

    const statusOptions = [
        {
            label: 'Backlog',
            key: 'backlog',
        },
        {
            label: 'In Progress',
            key: 'in-progress',
        },
        {
            label: 'Testing',
            key: 'testing',
        },
        {
            label: 'Complete',
            key: 'complete',
        },
        {
            label: 'Blocked',
            key: 'blocked',
        }
    ];

    useEffect(() => {
        switch (taskStatus) {
            case "In Progress":
                setColour('blue');
                break;
            case "Testing":
                setColour('purple');
                break;
            case "Complete":
                setColour('green');
                break;
            case "Blocked":
                setColour('red');
                break;
            default:
                setColour('#A0A0A0')
                break;
        }
    }, [taskStatus]);

    const changeTaskStatus = (event, taskProject, taskID) => {
        const newStatus = event.domEvent.target.innerText;
        
        updateTaskDetail(taskID, {field: 'status', value: newStatus}, user.token).then(() => {
            setTaskStatus(newStatus);
            updateTaskStatus(taskProject, taskID, newStatus);
        }).catch(err => {
            const error = err?.response.data ? err.response.data : err;
            messageApi.error(error);
        });
    };
    
    return {
        taskStatus,
        statusOptions,
        colour,
        contextHolder,
        changeTaskStatus
    };
};


export default useStatusTag;