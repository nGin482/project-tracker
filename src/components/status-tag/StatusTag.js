import { Tag, Dropdown } from "antd";

import useStatusTag from "./useStatusTag";


const StatusTag = props => {
    const { status, project, taskID, showDescription } = props;

    const {
        taskStatus,
        statusOptions,
        colour,
        contextHolder,
        changeTaskStatus
    } = useStatusTag(status);

    return (
        <div className="task-status">
            {showDescription && "Status: "}
            <Dropdown
                menu={{items: statusOptions, onClick: event => changeTaskStatus(event, project, taskID)}}
                trigger={['click']}
            >
                <Tag color={colour}>{taskStatus}</Tag>
            </Dropdown>
            {contextHolder}
        </div>
    );
}

export default StatusTag;