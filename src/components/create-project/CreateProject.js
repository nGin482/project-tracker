import { Form, Input, Modal } from "antd";

import useCreateProject from "./useCreateProject";

const CreateProject = props => {
    const { showForm, setShowForm } = props;
    const {
        form,
        contextHolder,
        createNewProject,
        cancelCreateProject,
        onProjectCodeChange
    } = useCreateProject(setShowForm);

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
                {contextHolder}
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