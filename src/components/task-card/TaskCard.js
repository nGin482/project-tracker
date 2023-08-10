import React, {useState, useEffect, useContext } from "react";
import { NavLink } from "react-router-dom";
import { Button, Card, Divider, message, Popconfirm, Popover } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import AdditionalDetails from "../sidebars/AdditionalDetails";
import TaskType from "../task-type-icon/TaskType";
import useProjects from "../../hooks/useProjects";
import UserContext from "../../contexts/UserContext";
import { updateTaskDetail, deleteTask } from "../../requests/taskRequests";
import "./TaskCard.css";

const TaskCard = props => {
    const { task } = props;
    const { title, description, comments, type, project } = task;
    
    const [editingTask, setEditingTask] = useState(false);
    const [newDescription, setNewDescription] = useState('');
    
    const [messageApi, contextHolder] = message.useMessage();
    const { updateTaskState, deleteTaskState } = useProjects();

    const { user } = useContext(UserContext);

    const updateTaskDetails = () => {
        const taskDescription = newDescription === '' ? description : newDescription;
        updateTaskDetail(task.taskID, {field: 'description', value: taskDescription}, user.token).then(data => {
            updateTaskState(project, task.taskID, data);
            setEditingTask(false);
        }).catch(err => {
            if (err?.response.data) {
                messageApi.error(err.response.data);
            }
            else {
                messageApi.error(err);
            }
        })
    }

    const handleDeleteTask = () => {
        deleteTask(task.taskID, user.token).then(data => {
            deleteTaskState(project, task.taskID);
        }).catch(err => {
            if (err?.response.data) {
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
            actions={[
                <NavLink to={`/task/${task.taskID}`}>View {task.taskID}</NavLink>,
                <Popover title={`Edit ${task.taskID}`}>
                    <EditOutlined onClick={() => setEditingTask(!editingTask)} />
                </Popover>
            ]}
        >
            {contextHolder}

            <div className="task-info task__general-info">
                {editingTask ? (
                    <>
                        <CKEditor
                            editor={ClassicEditor}
                            data={description}
                            onChange={(event, editor) => {
                                const data = editor.getData();
                                setNewDescription(data);
                            }}
                        />
                        <Button onClick={() => setEditingTask(false)}>Cancel</Button>
                        <Button htmlType="submit" type="primary" onClick={updateTaskDetails}>Update</Button>
                    </>
                ) : <div className="task-description" dangerouslySetInnerHTML={{__html: description}} />}
            </div>
            <AdditionalDetails
                taskDetails={task}
                width={200}    
            />
        </Card>
    );
};

export default TaskCard;