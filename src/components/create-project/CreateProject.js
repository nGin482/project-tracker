import { useState, useEffect, useContext } from "react";
import { Alert, Form, Input, Modal } from "antd";

import UserContext from "../../contexts/UserContext";
import { createProject } from "../../services/requests";

const CreateProject = props => {
    const { showForm, setShowForm } = props;
    const { user } = useContext(UserContext);

    const [form] = Form.useForm();
    const [errorsExist, setErrorsExist] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errors, setErrors] = useState(false);
    const [fieldsWithErrors, setFieldsWithErrors] = useState(false);

    const createNewProject = () => {
        form.validateFields().then(values => {
            console.log(values)
            setErrorsExist(false);
            setFieldsWithErrors(false);
            setErrorMessage('');
            createProject(values, user.token).then(data => {
                form.resetFields();
                setShowForm(false);
                console.log(data)
            })
        })
        .catch(err => {
            setErrorsExist(true);
            setErrors(err.errorFields);
            setErrorMessage("There was an error completing the form");
        })
    }

    const onProjectCodeChange = value => {
        form.setFieldsValue({projectCode: value.toUpperCase()});
    }

    useEffect(() => {
        if (errors) {
            const fields = []
            errors.forEach(field => {
                let fieldName = field.name[0];
                fieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
                fieldName = fieldName.replace('Project', 'Project ')

                fields.push({fieldName, errors: field.errors});
            })
            setFieldsWithErrors(fields);
        }
    }, [errors, errorsExist])

    const ErrorDescription = () => (
        fieldsWithErrors.map(field => 
            <>
                <span>{field.fieldName}</span>
                <ul>
                    {field.errors.map(error => <li>{error}</li>)}
                </ul>
            </>
        )
    )

    return (
        <Modal
            title="Create New Project"
            open={showForm}
            okText="Create"
            onOk={createNewProject}
            cancelText="Cancel"
            onCancel={() => setShowForm(false)}
        >
            <Form
                form={form}
            >
                {errorsExist && <Alert type="error" message={errorMessage} description={fieldsWithErrors && <ErrorDescription />} showIcon />}
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