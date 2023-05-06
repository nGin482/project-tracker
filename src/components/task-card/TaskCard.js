import React, {useState, useEffect } from "react";
import { Card, Tag, Divider, Space } from "antd";
import { EyeOutlined, EditOutlined, SettingOutlined } from "@ant-design/icons";

import StatusTag from "./StatusTag";
import "./TaskCard.css";
import AdditionalDetails from "../../AdditionalDetails";

const TaskCard = props => {
    const [task, setTask] = useState(props.task);
    const { title, project, status, description, comments } = task;

    useEffect(() => {
        console.log(task)
        // update the DB
    }, [task])
    
    const changeStatus = status => {
        setTask({...task, status: status})
    }


    return (
        <Card title={title} className="task-card" extra={<SettingOutlined />} actions={[<EyeOutlined key="view" />, <EditOutlined key="edit" />]}>
            <p>{description}</p>
            <AdditionalDetails
                status={task.status}
                changeStatus={changeStatus}
                project={task.project}
                created={task.created}
                width={200}    
            />

            {comments && comments.length > 0 ? (
                <>
                    <Divider />
                    <ul>
                        {comments.map((comment, i) => (
                            <li key={i}>
                                <p>{comment}</p>
                            </li>    
                        ))}
                    </ul>
                </>
            ) : ''}
        </Card>
    );
}

export default TaskCard;