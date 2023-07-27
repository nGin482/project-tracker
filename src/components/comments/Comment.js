import { useState, useContext } from "react";
import { Button } from "antd";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import UserContext from "../../contexts/UserContext";
import useProjects from "../../hooks/useProjects";
import { editComment } from "../../services/requests";

const Comment = ({comment, task, setTask}) => {
    const [newCommentContent, setNewCommentContent] = useState('');
    const [editingComment, setEditingComment] = useState(false);

    const { user } = useContext(UserContext);
    const { updateTaskState } = useProjects();
    
    const editCommentContent = () => {
        editComment(task.taskID, comment.commentID, newCommentContent, user.token).then(data => {
            updateTaskState(task.project, task.taskID, data);
            setTask(data);
            setEditingComment(false);
            setNewCommentContent('');
        })
        .catch(err => {
            
        })
    }

    return (
        <div className="comment">
            <span className="commenter">{comment.commenter?.username}</span>
            <span className="comment-date">{comment.commentDate}</span>
            {editingComment ? (
                <CKEditor
                    data={comment.content}
                    editor={ClassicEditor}
                    onChange={(event, editor) => {
                        const data = editor.getData();
                        setNewCommentContent(data);
                    }}
                />
            ) :
                <div dangerouslySetInnerHTML={{__html: comment.content}} />
            }

            <div className="comment-actions">
                {editingComment ? (
                    <>
                        <Button id="add-comment" onClick={editCommentContent}>Save</Button>
                        <Button id="cancel-comment" onClick={() => setEditingComment(false)}>Cancel</Button>
                    </>
                ) :
                <>
                    <span className="edit-comment" onClick={() => setEditingComment(true)}>
                        Edit Comment
                    </span>
                    <span className="delete-comment">Delete Comment</span>
                </>
                }
            </div>
        </div>
    );
};

export default Comment;