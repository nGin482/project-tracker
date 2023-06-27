import { useState, useContext } from "react";

import ProjectContext from "../contexts/ProjectContext";


const useProjects = () => {
    const { projects, setProjects } = useContext(ProjectContext);

    const addTask = task => {

    };

    const updateTaskState = (project, taskID, updatedTask) => {
        
    };

    const deleteTaskState = (project, taskID) => {
        setProjects(projects => {
            const updatedProjects = [...projects];
            const projectForTask = updatedProjects.find(proj => proj.projectName === project);
            projectForTask.tasks = projectForTask.tasks.filter(projectTask => projectTask.taskID !== taskID);
            return updatedProjects;
        });
    };


    return {
        projects,
        addTask,
        updateTaskState,
        deleteTaskState
    };
};

export default useProjects;