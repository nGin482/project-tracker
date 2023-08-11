import { Form, Input, Select, Modal } from "antd";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import FileUploadAdapter from "./FileUploadAdapter";
import useNewTask from "./useNewTask";
import "./NewTask.css";

const NewTask = (props) => {
    const { showForm, setShowForm } = props;
    const { Option } = Select;

    const {
        createNewTask,
        cancelCreateNewTask,
        searchRelatedTasks,
        renderDescriptionEditor,
        relatedTasksFound,
        delayEditorLoad,
        contextHolder,
        user,
        form
    } = useNewTask(showForm, setShowForm);

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
                {contextHolder}
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
                            onReady={editor => {
                                editor.plugins.get('FileRepository')
                                .createUploadAdapter = loader => new FileUploadAdapter(loader, user.token);
                            }}
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