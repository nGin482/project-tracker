import { useState, useContext } from "react";
import { message } from "antd";

import useProjects from "../../hooks/useProjects";
import UserContext from "../../contexts/UserContext";
import { updateTaskDetail, deleteTask } from "../../requests/taskRequests";

const useTaskCard = description => {
    const [editingTask, setEditingTask] = useState(false);
    const [newDescription, setNewDescription] = useState('');
    
    const [messageApi, contextHolder] = message.useMessage();
    const { updateTaskState, deleteTaskState } = useProjects();

    const { user } = useContext(UserContext);

    const updateDescription = (taskID, project) => {
        const taskDescription = newDescription === '' ? description : newDescription;
        updateTaskDetail(taskID, {field: 'description', value: taskDescription}, user.token).then(data => {
            updateTaskState(project, taskID, data);
            setEditingTask(false);
        }).catch(err => {
            const error = err?.response.data ? err.response.data : err;
            messageApi.error(error);
        })
    };

    const handleDeleteTask = (taskID, project) => {
        deleteTask(taskID, user.token).then(data => {
            deleteTaskState(project, taskID);
            messageApi.success(data);
        }).catch(err => {
            const error = err?.response.data ? err.response.data : err;
            messageApi.error(error);
        });
    };
    
    return {
        editingTask: {
            editingTask,
            setEditingTask
        },
        newDescription: {
            newDescription,
            setNewDescription
        },
        contextHolder,
        updateDescription, 
        handleDeleteTask        
    };
};


export default useTaskCard;