import { useState, useEffect, useContext } from "react";
import { Form, message } from "antd";

import ProjectContext from "../../contexts/ProjectContext";
import UserContext from "../../contexts/UserContext";
import useProjects from "../../hooks/useProjects";
import { createTask } from "../../requests/taskRequests";

const useNewTask = (showForm, setShowForm) => {
    const [relatedTasksFound, setRelatedTasksFound] = useState([]);
    const [delayEditorLoad, setDelayEditorLoad] = useState(false);

    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const { projects } = useContext(ProjectContext);
    const { addTaskToState } = useProjects();
    const { user } = useContext(UserContext);

    const createNewTask = () => {
        form.validateFields().then(values => {
            const task = {...values, status: 'Backlog'};
            createTask(task, user.token).then(data => {
                const { project } = task;
                addTaskToState(project, data);
                setShowForm(false);
                form.resetFields();
            })
            .catch(err => {
                const error = err?.response.data ? err.response.data : err;
                messageApi.error(error);
            })
        })
        .catch(err => {
            messageApi.error('Please ensure all fields are filled out correctly');
        })
    };

    const cancelCreateNewTask = () => {
        setShowForm(false);
        form.resetFields();
    };

    const searchRelatedTasks = searchTerm => {
        if (searchTerm === '') {
            setRelatedTasksFound(projects);
        }
        else {
            let searchResults = [];
            projects.forEach(project => {
                searchResults = searchResults.concat(
                    project.tasks.filter(task => 
                        task.title.toLowerCase().includes(searchTerm) ||
                        task.taskID.toLowerCase().includes(searchTerm)
                    )
                );
            });
            setRelatedTasksFound(searchResults.map(result => (
                {
                    label: `${result.taskID}: ${result.title}`,
                    value: result.taskID
                }
            )));
        }
    };

    // Webpack throws a ResizeObserver loop limit exceeded error
    // This was introduced when the CKEditor has been introduced into the Modal,
    // where the resizing of the CKEditor as the Modal grows is causing the resize
    // handling to be constantly called.
    // The below function sets a state variable when the Modal has finished loading,
    // which acts as a signal to render the CKEditor into the form
    // TODO: might be able to update this to only execute in development
    const renderDescriptionEditor = () => {
        showForm ? setDelayEditorLoad(true) : setDelayEditorLoad(false);
    };

    useEffect(() => {
        let initialTasks = [];
        projects.forEach(project => {
            project.tasks.forEach(task => {
                const searchItem = {
                    label: `${task.taskID}: ${task.title}`,
                    value: task.taskID
                };
                initialTasks = [...initialTasks, searchItem];                
            })
        });
        setRelatedTasksFound(initialTasks);
    }, [projects]);
    
    return {
        relatedTasksFound,
        delayEditorLoad,
        contextHolder,
        user,
        form,
        createNewTask,
        cancelCreateNewTask,
        searchRelatedTasks,
        renderDescriptionEditor
    };
};


export default useNewTask;