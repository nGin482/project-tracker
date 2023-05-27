import { useState, useContext } from "react";
import { Form, Input, Select, Alert, Modal } from "antd";

import { createTask } from "../../services/requests";
import TasksContext from "../../contexts/TasksContext";
import UserContext from "../../contexts/UserContext";
import "./NewTask.css";

const NewTask = (props) => {
    const { showForm, setShowForm, project } = props;
    const { Option } = Select;

    const [form] = Form.useForm();
    const [showAlertBanner, setShowAlertBanner] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const { tasks, setTasks } = useContext(TasksContext);
    const { user } = useContext(UserContext);

    const createNewTask = () => {
        form.validateFields().then(values => {
            const task = {...values, status: 'Backlog', project: project};
            createTask(task, user.token).then(data => {
                setTasks([...tasks, data.task]);
                setShowForm(false);
                form.resetFields();
                setShowAlertBanner(false);
                setErrorMessage('');
            })
            .catch(err => {
                if (err.response.data) {
                    setErrorMessage(err.response.data);
                }
                else {
                    setErrorMessage('An internal server error occurred');
                }
                setShowAlertBanner(true);
            })
        })
        .catch(err => {
            setErrorMessage('An error occured. Please check the form and the data entered');
            setShowAlertBanner(true);
        })
    }

    return (
        <Modal
            title="Create a new Task"
            open={showForm}
            okText="Create"
            onOk={createNewTask}
            cancelText="Cancel"
            onCancel={() => setShowForm(false)}
        >
            <Form
                form={form}
            >
                {showAlertBanner ? <Alert type="error" message={errorMessage} showIcon /> : ''}
                {!project ? (
                    <Form.Item
                    label="Project"
                    name="project"
                    rules={[
                        {
                            required: true,
                            message: "Please choose which project this task is for."
                        }
                    ]}
                >
                    <Select>
                        <Option value="tv-guide">TV Guide</Option>
                        <Option value="tv-guide-ui">TV Guide UI</Option>
                        <Option value="project-tracker">Project Tracker</Option>
                        <Option value="read-list">Read List</Option>
                        <Option value="dvd-library">DVD Library</Option>
                    </Select>
                </Form.Item>
                ) : ''}
                
                <Form.Item 
                    label="Title"
                    name="title"
                    rules={[
                        {
                            required: true,
                            message: 'Please create a title for the task.'
                        }
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Description"
                    name="description"
                    rules={[
                        {
                            required: true,
                            message: "Please enter a description for the task."
                        }
                    ]}
                >
                    <Input.TextArea />
                </Form.Item>
                <Form.Item
                    label="Type"
                    name="type"
                    rules={[
                        {
                            required: true,
                            message: "Please choose the type of task."
                        }
                    ]}
                >
                    <Select>
                        <Option value="task">Task</Option>
                        <Option value="bug">Bug</Option>
                        <Option value="epic">Epic</Option>
                        <Option value="investigation">Investigation</Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default NewTask;