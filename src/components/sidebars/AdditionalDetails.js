import { useState, useEffect } from "react";
import { Space, Tag } from "antd";

import StatusTag from "../status-tag/StatusTag";
import "./AdditionalDetails.css";
import Sider from "antd/es/layout/Sider";


const AdditionalDetails = props => {
    const { status, project, created, showHeader, width } = props;

    return (
        <Sider width={width} className="additional-details">
            {showHeader ? <h4>Task Details</h4> : ''}
            <Space direction="vertical" size="small">
                <StatusTag status={status} showDescription={true}/>
                <span className="project">Project: <Tag color="blue-inverse">{project}</Tag></span>
                <span className="created">Created: <Tag color="#e57200">{created}</Tag></span>
            </Space>
        </Sider>
    );
};

export default AdditionalDetails;