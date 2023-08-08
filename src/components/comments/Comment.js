import { useState } from "react";

import EditComment from "./EditComment";
import useComments from "./useComments";

const Comment = props => {
    const { comment, task, setTask } = props;
    const [editingComment, setEditingComment] = useState(false);
    
    const { contextHolder, removeComment } = useComments(task, setTask);

    return (
        <div className="comment">
            {contextHolder}
            <span className="commenter">{comment.commenter?.username}</span>
            <span className="comment-date">{comment.commentDate}</span>
            {editingComment ? 
                <EditComment
                    comment={comment}
                    task={task}
                    setTask={setTask}
                    setEditingComment={setEditingComment}
                />
            :
                <div className="comment-content" dangerouslySetInnerHTML={{__html: comment.content}} />
            }

            <div className="comment-actions">
                {!editingComment && (
                    <>
                        <span className="comment-actions edit-comment" onClick={() => setEditingComment(true)}>
                            Edit Comment
                        </span>
                        <span className="comment-actions delete-comment" onClick={() => removeComment(comment)}>Delete Comment</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default Comment;