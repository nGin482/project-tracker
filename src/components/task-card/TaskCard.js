import React, {useState, useEffect, useContext } from "react";
import { NavLink } from "react-router-dom";
import { Card, Divider, message, Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

import AdditionalDetails from "../sidebars/AdditionalDetails";
import TaskType from "../task-type-icon/TaskType";
import useProjects from "../../hooks/useProjects";
import UserContext from "../../contexts/UserContext";
import { deleteTask } from "../../services/requests";
import "./TaskCard.css";

const TaskCard = props => {
    const [task, setTask] = useState(props.task);
    const { title, description, comments, type, project } = task;
    const [messageApi, contextHolder] = message.useMessage();

    const { deleteTaskState } = useProjects();
    const { user } = useContext(UserContext);

    useEffect(() => {
        console.log(task)
        // update the DB
    }, [task]);

    const handleDeleteTask = () => {
        deleteTask(task.taskID, user.token).then(data => {
            deleteTaskState(project, task.taskID);
        }).catch(err => {
            if (err.response.data) {
                messageApi.error(err.response.data);
            }
            else {
                messageApi.error(err);
            }
        });
    };
    
    
    return (
        <Card
            title={<div><TaskType type={type} /><span className={`task-title task-title__${type}`}>{title}</span></div>}
            className="task-card"
            extra={
                <Popconfirm
                    title={`Delete ${task.taskID}`}
                    description="Are you sure you want to delete this task?"
                    onConfirm={handleDeleteTask}
                    okText="Yes"
                    cancelText="No"
                >
                    <DeleteOutlined />
                </Popconfirm>
            }
            actions={[<NavLink to={`/task/${task.taskID}`}>View {task.taskID}</NavLink>]}
        >
            {contextHolder}

            <div className="task-description" dangerouslySetInnerHTML={{__html: description}} />
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