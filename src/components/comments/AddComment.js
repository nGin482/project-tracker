import { useState } from "react";
import { Button } from "antd";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import useProjects from "../../hooks/useProjects";
import { commentTask } from "../../services/requests";

const AddComment = props => {
    const { messageApi, setTask, task, user } = props;
    const [comment, setComment] = useState('');
    
    const { updateTaskState } = useProjects();

    const addComment = () => {
        if(comment === '') {
            messageApi.error('Please add a comment before submitting.');
        }
        else {
            commentTask(task.taskID, comment, user.token).then(data => {
                updateTaskState(task.project, task.taskID, data);
                setTask(data);
                setComment('');
            })
            .catch(err => {
                err.response ? console.log(err.response.data) : console.log(err)
            })
        }
    };

    return (
        <>
            <CKEditor
                editor={ClassicEditor}
                onChange={(event, editor) => {
                    const data = editor.getData();
                    setComment(data);
                }}
            />
            <Button onClick={addComment}>Comment</Button>
        </>
    );
};

export default AddComment;