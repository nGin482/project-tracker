import { useState, useContext } from "react";

import EditComment from "./EditComment";
import UserContext from "../../contexts/UserContext";
import useProjects from "../../hooks/useProjects";
import { deleteComment } from "../../services/requests";

const Comment = ({comment, task, setTask, messageApi}) => {
    const [editingComment, setEditingComment] = useState(false);
    
    const { user } = useContext(UserContext);
    const { updateTaskState } = useProjects();

    const removeComment = () => {
        deleteComment(task.taskID, comment.commentID, user.token).then(data => {
            updateTaskState(task.project, task.taskID, data.task);
            setTask(data.task);
            messageApi.success(data.message);
        })
        .catch(err => {
            const errorMessage = err.response ? err.response.data : err;
            messageApi.error(errorMessage);
        });
    };

    return (
        <div className="comment">
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
                        <span className="comment-actions delete-comment" onClick={removeComment}>Delete Comment</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default Comment;