import { useState, useEffect, useContext } from "react";
import { Form, Input, Select, Alert, Modal } from "antd";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import { createTask } from "../../services/requests";
import ProjectContext from "../../contexts/ProjectContext";
import UserContext from "../../contexts/UserContext";
import "./NewTask.css";

const NewTask = (props) => {
    const { showForm, setShowForm } = props;
    const { Option } = Select;

    const [form] = Form.useForm();
    const [relatedTasksFound, setRelatedTasksFound] = useState([]);
    const [delayEditorLoad, setDelayEditorLoad] = useState(false);
    const [errorsExist, setErrorsExist] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
   
    const { projects, setProjects } = useContext(ProjectContext);
    const { user } = useContext(UserContext);

    useEffect(() => {
        let initialTasks = [];
        projects.forEach(project => {
            project.tasks.forEach(task => {
                const searchItem = {
                    label: `${task.taskID}: ${task.title}`,
                    value: task.taskID
                };
                initialTasks = [...initialTasks, searchItem];                
            })
        })
        setRelatedTasksFound(initialTasks);
    }, [projects])

    const createNewTask = () => {
        form.validateFields().then(values => {
            const task = {...values, status: 'Backlog'};
            createTask(task, user.token).then(data => {
                const { project } = task;
                setProjects(projects => {
                    const newProjects = [...projects];
                    const updateProject = newProjects.find(proj => proj.projectName === project);
                    updateProject.tasks = [...updateProject.tasks, data.task];
                    return newProjects;
                });
                setShowForm(false);
                form.resetFields();
                setErrorsExist(false);
                setErrorMessage('');
            })
            .catch(err => {
                if (err?.response.data) {
                    setErrorMessage(err.response.data);
                }
                else {
                    setErrorMessage('Please try again later');
                }
                setErrorsExist(true);
            })
        })
        .catch(err => {
            setErrorMessage('Please ensure all fields are filled out correctly')
            setErrorsExist(true);
        })
    };

    const cancelCreateNewTask = () => {
        setShowForm(false);
        form.resetFields();
        setErrorMessage('');
        setErrorsExist(false);
    }

    const searchRelatedTasks = searchTerm => {
        if (searchTerm === '') {
            setRelatedTasksFound(projects);
        }
        else {
            let searchResults = [];
            projects.forEach(project => {
                searchResults = searchResults.concat(
                    project.tasks.filter(task => 
                        task.title.toLowerCase().includes(searchTerm) ||
                        task.taskID.toLowerCase().includes(searchTerm)
                    )
                );
            });
            setRelatedTasksFound(searchResults.map(result => (
                {
                    label: `${result.taskID}: ${result.title}`,
                    value: result.taskID
                }
            )));
        }
    };

    // Webpack throws a ResizeObserver loop limit exceeded error
    // This was introduced when the CKEditor has been introduced into the Modal,
    // where the resizing of the CKEditor as the Modal grows is causing the resize
    // handling to be constantly called.
    // The below function sets a state variable when the Modal has finished loading,
    // which acts as a signal to render the CKEditor into the form
    // TODO: might be able to update this to only execute in development
    const renderDescriptionEditor = () => {
        showForm ? setDelayEditorLoad(true) : setDelayEditorLoad(false);
    }

    return (
        <Modal
            title="Create a new Task"
            open={showForm}
            okText="Create"
            onOk={createNewTask}
            cancelText="Cancel"
            onCancel={cancelCreateNewTask}
            className="create-modal"
            afterOpenChange={renderDescriptionEditor}
        >
            <Form
                form={form}
            >
                {errorsExist && <Alert
                    type="error"
                    message={errorMessage}
                    showIcon
                />}
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
                        <Option value="TV Guide">TV Guide</Option>
                        <Option value="tv-guide-ui">TV Guide UI</Option>
                        <Option value="Project Tracker">Project Tracker</Option>
                        <Option value="read-list">Read List</Option>
                        <Option value="dvd-library">DVD Library</Option>
                    </Select>
                </Form.Item>
                
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
                    getValueFromEvent={(event, editor) => {
                        const data = editor.getData();
                        return data;
                    }}
                    rules={[
                        {
                            required: true,
                            message: "Please enter a description for the task."
                        }
                    ]}
                >
                    {delayEditorLoad ? (
                        <CKEditor
                            editor={ClassicEditor}
                        />
                    ) :
                        <Input.TextArea />
                    }
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
                <Form.Item
                    label="Related Tasks"
                    name="linkedTasks"
                >
                    <Select
                        mode="multiple"
                        onSearch={text => searchRelatedTasks(text)}
                        options={relatedTasksFound}
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default NewTask;