import { useState } from "react";
import { Button } from "antd";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import useProjects from "../../hooks/useProjects";
import { commentTask } from "../../services/requests";

const AddComment = props => {
    const { messageApi, setTask, task, user } = props;
    const [comment, setComment] = useState('');
    const [makingComment, setMakingComment] = useState(false);
    
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
                setMakingComment(false);
            })
            .catch(err => {
                const errorMessage = err.response ? err.response.data : err;
                messageApi.error(errorMessage);
            })
        }
    };

    return (
        <div id="add-comment-wrapper">
            {makingComment ? (
                <>
                    <CKEditor
                        editor={ClassicEditor}
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            setComment(data);
                        }}
                    />
                    <Button id="add-comment" onClick={addComment}>Comment</Button>
                    <Button id="cancel-comment" onClick={() => setMakingComment(false)}>Cancel</Button>
                </>
            ) : (
                <div id="comment-placeholder" onClick={() => setMakingComment(true)}>
                    <span>Add a comment</span>
                </div>
            )}
        </div>
    );
};

export default AddComment;