import { useState, useContext } from "react";
import { Alert, Form, Input, Modal } from "antd";

import UserContext from "../../contexts/UserContext";
import ProjectContext from "../../contexts/ProjectContext";
import { createProject } from "../../services/requests";

const CreateProject = props => {
    const { showForm, setShowForm } = props;
    const { user } = useContext(UserContext);
    const { projects, setProjects } = useContext(ProjectContext);

    const [form] = Form.useForm();
    const [errorsExist, setErrorsExist] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const createNewProject = () => {
        form.validateFields().then(values => {
            setErrorsExist(false);
            createProject(values, user.token).then(data => {
                form.resetFields();
                setShowForm(false);
                setProjects([...projects, data]);
            }).catch(err => {
                if (err.response.data) {
                    setErrorMessage(err.response.data);
                }
                else {
                    setErrorMessage('Please try again later');
                }
            })
        })
        .catch(err => {
            setErrorsExist(true);
            setErrorMessage('Please ensure all fields are filled out correctly');
        })
    };

    const cancelCreateProject = () => {
        setShowForm(false);
        setErrorsExist(false);
        form.resetFields();
    }

    const onProjectCodeChange = value => {
        form.setFieldsValue({projectCode: value.toUpperCase()});
    }

    return (
        <Modal
            title="Create New Project"
            open={showForm}
            okText="Create"
            onOk={createNewProject}
            cancelText="Cancel"
            onCancel={cancelCreateProject}
            className="create-modal"
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
                    label="Project Name"
                    name="projectName"
                    rules={[
                        {
                            required: true,
                            message: "Please provide the name for this project."
                        }
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Project Code"
                    name="projectCode"
                    rules={[
                        {
                            required: true,
                            message: "Please provide the code for this project."
                        }
                    ]}
                >
                    <Input
                        onChange={event => onProjectCodeChange(event.target.value)}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateProject;