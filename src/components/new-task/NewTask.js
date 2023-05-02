import { useState, useEffect } from "react";
import { Form, Input, Button, Select, Alert, Modal } from "antd";

import "./NewTask.css";

const NewTask = (props) => {
    const { showForm, setShowForm, project, onSuccess } = props;
    console.log(props)
    const { Option } = Select;

    const [showAlertBanner, setShowAlertBanner] = useState(false);
    const [form] = Form.useForm();

    const createTask = values => {
        console.log(values)

        const task = {...values, status: 'Backlog', project: project, id: 'DVD-02'};
        console.log(task);
        onSuccess(task);
        form.resetFields();
    }

    return (
        <Modal
            title="Create a new Task"
            open={showForm}
            okText="Create"
            onOk={() => {
                form.validateFields().then(values => {
                    createTask(values);
                    setShowForm(false);
                })
                .catch(err => {
                    console.log(err)
                    setShowAlertBanner(true)
                })
            }}
            cancelText="Cancel"
            onCancel={() => setShowForm(false)}
        >
            <Form
                form={form}
            >
                {showAlertBanner ? <Alert type="error" message="An Error Occurred!" showIcon /> : ''}
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