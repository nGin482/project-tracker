const CommentsDisplay = props => {
    const { comments, taskID } = props;

    return (
        <>
            <h4>Comments</h4>
            {comments.map((comment, i) => (
                <div className="comment" key={`task-${taskID}_comment-${i}`}>
                    <span className="commenter">{comment.commenter?.username}</span>
                    <span className="comment-date">{comment.commentDate}</span>
                    <div dangerouslySetInnerHTML={{__html: comment.content}} />
                </div>    
            ))}
        </>
    );
};

export default CommentsDisplay;