import { useEffect, useState } from "react";
import { Tag, Dropdown } from "antd";

import useTaskStatus from "../../hooks/useTaskStatus";


const StatusTag = props => {
    const { status, taskID, showDescription } = props;
    const [colour, setColour] = useState('#A0A0A0');
    const { taskStatus, changeStatus } = useTaskStatus(status);

    const items = [
        {
            label: 'Backlog',
            key: 0,
        },
        {
            label: 'In Progress',
            key: 1,
        },
        {
            label: 'Testing',
            key: 2,
        },
        {
            label: 'Complete',
            key: 3,
        },
        {
            label: 'Blocked',
            key: 4,
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

    const onClick = event => {
        changeStatus(taskID, event.domEvent.target.innerText);
    }

    return (
        <div className="task-status">
            {showDescription && "Status: "}<Dropdown menu={{items,onClick,}} trigger={['click']}>
                <Tag color={colour}>{taskStatus}</Tag>
            </Dropdown>
        </div>
    );
}

export default StatusTag;