import { NavLink } from "react-router-dom";
import { Button, Card, Popconfirm, Popover } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import AdditionalDetails from "../sidebars/AdditionalDetails";
import TaskType from "../task-type-icon/TaskType";
import useTaskCard from "./useTaskCard";
import "./TaskCard.css";

const TaskCard = props => {
    const { task } = props;
    const { taskID, title, description, type, project } = task;

    const {
        newDescription,
        editingTask,
        contextHolder,
        updateDescription,
        handleDeleteTask 
    } = useTaskCard(description);
    
    return (
        <Card
            title={<div><TaskType type={type} /><span className={`task-title task-title__${type}`}>{title}</span></div>}
            className="task-card"
            extra={
                <Popconfirm
                    title={`Delete ${task.taskID}`}
                    description="Are you sure you want to delete this task?"
                    onConfirm={() => handleDeleteTask(taskID, project)}
                    okText="Yes"
                    cancelText="No"
                >
                    <DeleteOutlined />
                </Popconfirm>
            }
            actions={[
                <NavLink to={`/task/${task.taskID}`}>View {task.taskID}</NavLink>,
                <Popover title={`Edit ${task.taskID}`}>
                    <EditOutlined onClick={() => editingTask.setEditingTask(!editingTask.editingTask)} />
                </Popover>
            ]}
        >
            {contextHolder}

            <div className="task-info task__general-info">
                {editingTask.editingTask ? (
                    <>
                        <CKEditor
                            editor={ClassicEditor}
                            data={description}
                            onChange={(event, editor) => {
                                const data = editor.getData();
                                newDescription.setNewDescription(data);
                            }}
                        />
                        <Button onClick={() => editingTask.setEditingTask(false)}>Cancel</Button>
                        <Button
                            htmlType="submit"
                            type="primary"
                            onClick={() => updateDescription(taskID, project)}
                        >
                            Update
                        </Button>
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