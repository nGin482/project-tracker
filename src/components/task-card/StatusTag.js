import { useEffect, useState } from "react";
import { Tag, Dropdown } from "antd";


const StatusTag = props => {
    const { status, handleStatus } = props;
    const [colour, setColour] = useState('#A0A0A0');

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
        switch (status) {
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
    }, [status]);

    const onClick = event => {
        handleStatus(event.domEvent.target.innerText)
    }

    return (
        <div className="task-status">
            Status: <Dropdown menu={{items,onClick,}} trigger={['click']}>
                <Tag color={colour}>{status}</Tag>
            </Dropdown>
        </div>
    );
}

export default StatusTag;