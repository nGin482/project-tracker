import { useState, useContext } from "react";
import { Alert, AutoComplete, Button, Modal } from "antd";

import UserContext from "../../contexts/UserContext";
import { linkTasks } from "../../services/requests";

const LinkTasks = props => {
    const { taskID, tasksByProject, setVisible, setTask } = props;
    const { user } = useContext(UserContext);

    const [linkedTasks, setLinkedTasks] = useState([]);
    const [linkTaskInput, setLinkTaskInput] = useState('');
    const [linkTasksDropdownVisibile, setLinkTasksDropdownVisibile] = useState(false);
    const [linkTasksDropdownOptions, setLinkTasksDropdownOptions] = useState(false);
    
    // Errors
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

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
    }

    const cancelLinkingTask = () => {
        setLinkTaskInput('');
        setLinkTasksDropdownVisibile(false);
        setLinkedTasks([]);
        setVisible(false);
    }
    
    const confirmLinkTasks = () => {
        const tasksToLink = linkedTasks.map(task => task.split(': ')[0])
        linkTasks(taskID, {linkedTasks: tasksToLink}, user.token).then(data => {
            setLinkedTasks([]);
            setTask(task => {
                const updatedTask = {...task, linkedTasks: task.linkedTasks.concat(data.linkedTasks)}
                return updatedTask;
            });
        })
        .catch(err => {
            setShowErrorModal(true)
            err.response.data ? setErrorMessage(err.response.data) : setErrorMessage(err);
        })
    }

    const closeFailureModal = () => {
        setShowErrorModal(false);
        setErrorMessage('');
    }

    return (
        <>
            <div id="link-task-input">
                <AutoComplete
                    className="link-task-search"
                    onSearch={text => linkSearchTasks(text)}
                    onSelect={item => selectLinkedTask(item)}
                    open={linkTasksDropdownVisibile}
                    options={linkTasksDropdownOptions}
                    placeholder="Search for Task to Link"
                    value={linkTaskInput}
                />
                {linkedTasks.length > 0 && (    
                    <div id="confirm-cancel-link">
                        <Button
                            type="primary"
                            onClick={() => confirmLinkTasks()}
                        >
                            Confirm
                        </Button>
                        <Button
                            type="default"
                            className="cancel-link-tasks"
                            onClick={cancelLinkingTask}
                        >
                            Cancel
                        </Button>
                    </div>
                )}
            </div>
            {linkedTasks.map((task, i) => (
                <div className="link-task" key={`link-task-${i}`}>
                    <span>{task}</span>
                    <Button
                        onClick={() => removeLinkTask(task)}
                        className="remove-link-task"
                    >
                        Remove
                    </Button>
                </div>
            ))}
            <Modal
                open={showErrorModal}
                onCancel={cancelLinkingTask}
                onOk={closeFailureModal}
            >
                <Alert type="error" message={errorMessage} showIcon />
            </Modal>
        </> 
    )
};

export default LinkTasks;