import React, {useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Divider } from "antd";
import { EyeOutlined, EditOutlined, SettingOutlined } from "@ant-design/icons";

import AdditionalDetails from "../sidebars/AdditionalDetails";
import "./TaskCard.css";

const TaskCard = props => {
    const [task, setTask] = useState(props.task);
    const { title, project, status, created, description, comments } = task;
    const navigate = useNavigate();

    useEffect(() => {
        console.log(task)
        // update the DB
    }, [task]);
    
    
    return (
        <Card
            title={title}
            className="task-card"
            extra={<SettingOutlined />} 
            actions={[<EyeOutlined key="view" onClick={() => navigate(`/task/${task.taskID}`)}/>, <EditOutlined key="edit" />]}
        >
            <p>{description}</p>
            <AdditionalDetails
                taskDetails={task}
                project={project}
                created={created}
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
};

export default TaskCard;