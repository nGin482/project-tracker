import Comment from "./Comment";

const CommentsDisplay = props => {
    const { task, setTask, messageApi } = props;
    let { comments } = props;

    comments = comments.reverse();

    return (
        <>
            <h4>Comments</h4>
            {comments.map(comment => (
                <Comment
                    key={`task-${task.taskID}_${comment.commentID}`}
                    comment={comment}
                    task={task}
                    setTask={setTask}
                    messageApi={messageApi}
                />
            ))}
        </>
    );
};

export default CommentsDisplay;