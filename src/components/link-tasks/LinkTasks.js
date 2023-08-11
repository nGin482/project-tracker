import { AutoComplete, Button } from "antd";

import useLinkTasks from "./useLinkTasks";

const LinkTasks = props => {
    const { taskID, tasksByProject, setVisible, setTask } = props;
    const {
        linkedTasks,
        linkTaskInput,
        linkTasksDropdownOptions,
        linkTasksDropdownVisibile,
        contextHolder,
        linkSearchTasks,
        selectLinkedTask,
        removeLinkTask,
        cancelLinkingTask,
        confirmLinkTasks
    } = useLinkTasks(tasksByProject, setVisible, taskID, setTask);

    return (
        <>
            <div id="link-task-input">
                {contextHolder}
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
        </> 
    )
};

export default LinkTasks;