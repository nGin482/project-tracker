import { useState, useEffect } from "react";
import { Space, Tag } from "antd";

import StatusTag from "../status-tag/StatusTag";
import Sider from "antd/es/layout/Sider";
import "./AdditionalDetails.css";


const AdditionalDetails = props => {
    const { taskDetails, showHeader, width } = props;
    const { status, project, created, creator } = taskDetails;

    return (
        <Sider width={width} className="additional-details">
            {showHeader && <h4>Task Details</h4>}
            <Space direction="vertical" size="small">
                <StatusTag status={status} taskID={taskDetails.taskID} showDescription={true}/>
                <span className="project">Project: <Tag color="blue-inverse">{project}</Tag></span>
                <span className="created">Created: <Tag color="#e57200">{created}</Tag></span>
                <span className="reporter">Reporter: <Tag>{creator}</Tag></span>
            </Space>
        </Sider>
    );
};

export default AdditionalDetails;