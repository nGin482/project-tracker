import { useState, useContext } from "react";

import ProjectContext from "../contexts/ProjectContext";


const useProjects = () => {
    const { projects, setProjects } = useContext(ProjectContext);

    const addTask = task => {

    };

    const updateTaskState = (project, taskID, updatedTask) => {
        setProjects(projects => {
            const updatedProjects = [...projects];
            const projectToUpdate = updatedProjects.find(proj => proj.projectName === project);
            const taskIndex = projectToUpdate.tasks.findIndex(task => task.taskID === taskID);
            projectToUpdate.tasks[taskIndex] = updatedTask;
            return updatedProjects;
        });
    };

    const deleteTaskState = (project, taskID) => {
        setProjects(projects => {
            const updatedProjects = [...projects];
            const projectForTask = updatedProjects.find(proj => proj.projectName === project);
            projectForTask.tasks = projectForTask.tasks.filter(projectTask => projectTask.taskID !== taskID);
            return updatedProjects;
        });
    };

    const deleteProjectState = projectName => {
        const updatedProjects = projects.filter(project => project.projectName !== projectName);
        setProjects(updatedProjects);
    };

    return {
        projects,
        addTask,
        updateTaskState,
        deleteTaskState,
        deleteProjectState
    };
};

export default useProjects;