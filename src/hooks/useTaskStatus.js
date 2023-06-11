import { useState, useContext } from "react";

import ProjectContext from "../contexts/ProjectContext";
import UserContext from "../contexts/UserContext";
import { updateTask } from "../services/requests";

const useTaskStatus = status => {
    const [taskStatus, setTaskStatus] = useState(status);
    const { setProjects } = useContext(ProjectContext);
    const { user } = useContext(UserContext);

    const changeStatus = (taskID, newStatus) => {
        return updateTask(taskID, {field: 'status', value: newStatus}, user.token).then(() => {
            setTaskStatus(newStatus);
            setProjects(projects => {
                projects.forEach(project => {
                    const updateTask = project.tasks.find(task => task.taskID === taskID);
                    updateTask.status = newStatus;
                })
                return projects;
            })
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