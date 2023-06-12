import React, {useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Card, Divider } from "antd";
import { EditOutlined, SettingOutlined } from "@ant-design/icons";

import AdditionalDetails from "../sidebars/AdditionalDetails";
import TaskType from "../task-type-icon/TaskType";
import "./TaskCard.css";

const TaskCard = props => {
    const [task, setTask] = useState(props.task);
    const { title, description, comments, type } = task;

    useEffect(() => {
        console.log(task)
        // update the DB
    }, [task]);
    
    
    return (
        <Card
            title={<div><TaskType type={type} /><span className={`task-title task-title__${type}`}>{title}</span></div>}
            className="task-card"
            extra={<SettingOutlined />} 
            actions={[<NavLink to={`/task/${task.taskID}`}>View {task.taskID}</NavLink>, <EditOutlined key="edit" />]}
        >
            <p>{description}</p>
            <AdditionalDetails
                taskDetails={task}
                width={200}    
            />

            {comments && comments.length > 0 &&
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
            }
        </Card>
    );
};

export default TaskCard;