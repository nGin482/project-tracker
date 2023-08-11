import { useState, useContext } from "react";
import { message } from "antd";

import UserContext from "../../contexts/UserContext";
import { linkTasks } from "../../requests/taskRequests";


const useLinkTasks = (tasksByProject, setVisible, taskID, setTask) => {
    const [linkedTasks, setLinkedTasks] = useState([]);
    const [linkTaskInput, setLinkTaskInput] = useState('');
    const [linkTasksDropdownVisibile, setLinkTasksDropdownVisibile] = useState(false);
    const [linkTasksDropdownOptions, setLinkTasksDropdownOptions] = useState(false);
    
    const [messageApi, contextHolder] = message.useMessage();

    const { user } = useContext(UserContext);

    const linkSearchTasks = searchTerm => {
        setLinkTasksDropdownVisibile(true);
        setLinkTaskInput(searchTerm);
        if (searchTerm !== '') {
            setLinkTasksDropdownOptions(
                tasksByProject.filter(task => 
                    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    task.taskID.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(task => ({value: `${task.taskID}: ${task.title}`}))
            );
        }
        else {
            setLinkTasksDropdownVisibile(false);
        }
    };

    const selectLinkedTask = item => {
        setLinkTasksDropdownVisibile(false);
        setLinkedTasks([...linkedTasks, item]);
        setLinkTaskInput('');
    };

    const removeLinkTask = task => {
        setLinkedTasks(linkedTasks.filter(linkTask => linkTask !== task));
    };

    const cancelLinkingTask = () => {
        setLinkTaskInput('');
        setLinkTasksDropdownVisibile(false);
        setLinkedTasks([]);
        setVisible(false);
    };

    const confirmLinkTasks = () => {
        const tasksToLink = linkedTasks.map(task => task.split(': ')[0])
        linkTasks(taskID, {linkedTasks: tasksToLink}, user.token).then(data => {
            setLinkedTasks([]);
            setTask(task => {
                const updatedTask = {...task, linkedTasks: task.linkedTasks.concat(data.linkedTasks)};
                return updatedTask;
            });
        })
        .catch(err => {
            const error = err?.response.data ? err.response.data : err;
            messageApi.error(error);
        });
    };

    return {
        linkedTasks,
        linkTaskInput,
        linkTasksDropdownVisibile,
        linkTasksDropdownOptions,
        contextHolder,
        linkSearchTasks,
        selectLinkedTask,
        removeLinkTask,
        cancelLinkingTask,
        confirmLinkTasks
    };
};

export default useLinkTasks;