import { Button } from "antd";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import useComments from "./useComments";

const EditComment = props => {
    const { comment, task, setTask, setEditingComment } = props;

    const {
        setNewCommentContent,
        updateComment,
        contextHolder
    } = useComments(task, setTask, setEditingComment);

    return (
        <>
            {contextHolder}
            <CKEditor
                data={comment.content}
                editor={ClassicEditor}
                onChange={(event, editor) => {
                    const data = editor.getData();
                    setNewCommentContent(data);
                }}
            />
            <Button id="add-comment" onClick={() => updateComment(comment)}>Save</Button>
            <Button id="cancel-comment" onClick={() => setEditingComment(false)}>Cancel</Button>
        </>
    )
};

export default EditComment;