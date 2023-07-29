import { useState, useContext } from "react";
import { message } from "antd";

import UserContext from "../../contexts/UserContext";
import useProjects from "../../hooks/useProjects";
import { editComment, deleteComment } from "../../services/requests";

const useComments = (task, setTask, setEditingComment) => {
    const [messageApi, contextHolder] = message.useMessage();

    const [newCommentContent, setNewCommentContent] = useState('');
    const { user } = useContext(UserContext);
    const { updateTaskState } = useProjects();

    const updateComment = comment => {
        if (newCommentContent === '') {
            messageApi.error('Please enter a comment before updating.');
        }
        else {
            editComment(task.taskID, comment.commentID, newCommentContent, user.token).then(data => {
                updateTaskState(task.project, task.taskID, data);
                setTask(data);
                setEditingComment(false);
                setNewCommentContent('');
            })
            .catch(err => {
                const errorMessage = err.response ? err.response.data : err;
                messageApi.error(errorMessage);
            });
        }
    };

    return {
        setNewCommentContent,
        setEditingComment,
        updateComment,
        contextHolder
    };
};

export default useComments;