import { useContext } from "react";
import { Form, message } from "antd";

import UserContext from "../../contexts/UserContext";
import ProjectContext from "../../contexts/ProjectContext";
import { createProject } from "../../requests/projectRequests";

const useCreateProject = setShowForm => {
    const { user } = useContext(UserContext);
    const { projects, setProjects } = useContext(ProjectContext);
    
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const createNewProject = () => {
        form.validateFields().then(values => {
            createProject(values, user.token).then(data => {
                form.resetFields();
                setShowForm(false);
                setProjects([...projects, data]);
                messageApi.success('The project has successfully been created');
            }).catch(err => {
                const error = err?.response.data ? err.response.data : err;
                messageApi.error(error);
            })
        })
        .catch(err => {
            messageApi.error('Please ensure all fields are filled out correctly');
        });
    };

    const cancelCreateProject = () => {
        setShowForm(false);
        form.resetFields();
    };

    const onProjectCodeChange = value => {
        form.setFieldValue('projectCode', value.toUpperCase());
    };

    return {
        form,
        contextHolder,
        createNewProject,
        cancelCreateProject,
        onProjectCodeChange
    };
};

export default useCreateProject;