import {useState, useEffect, useContext} from "react";
import { message } from "antd";

import ProjectContext from "../../contexts/ProjectContext";
import UserContext from "../../contexts/UserContext";
import useProjects from "../../hooks/useProjects";
import { deleteProject } from "../../requests/projectRequests";

const useIndexPage = () => {
    const { projects, projectViewed, setProjectViewed } = useContext(ProjectContext);

    const [tasksDisplayed, setTasksDisplayed] = useState([]);
    const [showProjects, setShowProjects] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const { user } = useContext(UserContext);
    const { deleteProjectState } = useProjects();

    useEffect(() => {
        showAllTasks();
    }, [projects]);
    // TODO: Note: When projects state updates, this will then re-render all tasks,
    // TODO: regardless of what filter state has been applied

    useEffect(() => {
        if (projectViewed === 'All') {
            showAllTasks();
        }
        else {
            setTasksDisplayed(projectViewed.tasks);
        }
    }, [projectViewed]);

    function showAllTasks() {
        let allTasks = [];
        projects.forEach(project => allTasks = allTasks.concat(project.tasks));
        setTasksDisplayed(allTasks);
    };

    const switchProjectViewed = item => {
        setProjectViewed(item);
        setShowProjects(false);
    };

    const handleDeleteProject = project => {
        deleteProject(project, user.token).then(data => {
            deleteProjectState(project);
            messageApi.success(data);
        })
        .catch(err => {
            const error = err?.response.data ? err.response.data : err;
            messageApi.error(error);
        });
    };
    
    return {
        tasksDisplayed,
        showProjects,
        setShowProjects,
        setProjectViewed,
        projects,
        contextHolder,
        switchProjectViewed,
        handleDeleteProject
    };
};


export default useIndexPage;