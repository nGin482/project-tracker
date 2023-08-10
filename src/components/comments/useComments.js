import { useState, useContext } from "react";
import { message } from "antd";

import UserContext from "../../contexts/UserContext";
import useProjects from "../../hooks/useProjects";
import { commentTask, editComment, deleteComment } from "../../requests/commentRequests";

const useComments = (task, setTask, setEditingComment, setMakingComment) => {
    const [messageApi, contextHolder] = message.useMessage();

    const [newCommentContent, setNewCommentContent] = useState('');
    const [comment, setComment] = useState('');
    const { user } = useContext(UserContext);
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

    const removeComment = comment => {
        deleteComment(task.taskID, comment.commentID, user.token).then(data => {
            messageApi.success(data.message);
            updateTaskState(task.project, task.taskID, data.task);
            setTask(data.task);
        })
        .catch(err => {
            const errorMessage = err.response ? err.response.data : err;
            messageApi.error(errorMessage);
        });
    };

    return {
        setNewCommentContent,
        setComment,
        addComment,
        updateComment,
        removeComment,
        contextHolder
    };
};

export default useComments;