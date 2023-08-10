import { useState } from "react";
import { Button } from "antd";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import useComments from "./useComments";

const AddComment = props => {
    const { setTask, task } = props;
    const [makingComment, setMakingComment] = useState(false);
    
    const { addComment, setComment } = useComments(task, setTask, undefined, setMakingComment);

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