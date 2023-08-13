import {useState, useEffect, useContext} from "react";
import { useParams, NavLink, useNavigate } from "react-router-dom";
import {
    Button,
    Divider,
    Input,
    Layout,
    message,
    Popconfirm,
    Spin
} from "antd";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { isEmpty, omit } from "lodash";

import AddComment from "../components/comments/AddComment";
import CommentsDisplay from "../components/comments/CommentsDisplay";
import AdditionalDetails from "../components/sidebars/AdditionalDetails";
import LinkTasks from "../components/link-tasks/LinkTasks";
import StatusTag from "../components/status-tag/StatusTag";
import CustomDrawer from "../components/custom-drawer/CustomDrawer";
import Navbar from "../components/navbar/Navbar";
import ErrorPage from "./ErrorPage";
import ErrorsContext from "../contexts/ErrorsContext";
import UserContext from "../contexts/UserContext";
import useProjects from "../hooks/useProjects";
import { getTask, getTasksByProject, updateTask, deleteTask } from "../requests/taskRequests";
import "./styles/TaskPage.css";
import "../components/comments/comments.css";


const TaskPage = () => {
    const { Content } = Layout;
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const { taskID } = useParams();
    const { updateTaskState, deleteTaskState } = useProjects();
    const { setErrorMessage, setErrorType } = useContext(ErrorsContext);
    const { user } = useContext(UserContext);

    // Task being viewed
    const [task, setTask] = useState({});
    
    //Task by Project Drawer
    const [tasksByProject, setTasksByProject] = useState([]);
    const [showTasksDrawer, setShowTasksDrawer] = useState(false);
    
    // Linking Tasks
    const [showLinkTasks, setShowLinkTasks] = useState(false);

    // Edit Task
    const [editingTask, setEditingTask] = useState(false);
    const [updatedTask, setUpdatedTask] = useState({});
    
    // Misc
    const [errors, setErrors] = useState(false);
    
    
    useEffect(() => {
        getTask(taskID).then(data => {
            setTask(data);
            setUpdatedTask({
                title: data.title,
                description: data.description,
                type: data.type,
                project: data.project
            });
            getTasksByProject(data.project).then(data => {
                setTasksByProject(data);
                setSearchResults(data)
            })
        }).catch(err => {
            setErrors(true);
            if (err.response.status === 404) {
                setErrorType('Not Found!');
            }
            setErrorMessage(err.response.data);
        })
    }, [taskID]);

    useEffect(() => {
        console.log(task)
    }, [task])

    const submitUpdateTask = () => {
        const finalTask = {
            ...task,
            title: updatedTask.title,
            description: updatedTask.description,
            type: updatedTask.type,
            project: updatedTask.project
        }
        updateTask(task.taskID, finalTask, user.token).then(data => {
            updateTaskState(task.project, task.taskID, data);
            setEditingTask(false);
            setTask(data);
        }).catch(err => {
            const error = err?.response.data ? err.response.data : err;
            messageApi.error(error);
        });
    };

    const handleDeleteTask = () => {
        deleteTask(task.taskID, user.token).then(data => {
            deleteTaskState(task.project, task.taskID);
            messageApi.success(data);
            navigate('/');
        }).catch(err => {
            const error = err?.response.data ? err.response.data : err;
            messageApi.error(error);
        });
    };

    return (
        <>
            <Navbar />
            {!isEmpty(task) ? (
                <div id="task-page">
                    {tasksByProject.length > 0 && (
                        <CustomDrawer
                            title={`Tasks in ${task.project}`}
                            view='tasks'
                            open={showTasksDrawer}
                            listItems={tasksByProject}
                            onClose={setShowTasksDrawer}

                        />
                    )}
                    <Layout>
                        <div id="task-main-content">
                            <div id="task-content">
                                <div className="task-action-buttons">
                                    <Button
                                        onClick={() => setShowTasksDrawer(true)}
                                        className="task-page-action-buttons"
                                        id="tasks-drawer-button"
                                    >
                                        Show Tasks in this Project
                                    </Button>
                                    <Button
                                        onClick={() => setShowLinkTasks(!showLinkTasks)}
                                        className="task-page-action-buttons"
                                        id="link-tasks"
                                    >
                                        Link Task
                                    </Button>
                                    <Button
                                        onClick={() => setEditingTask(!editingTask)}
                                        className="task-page-action-buttons"
                                        id="link-tasks"
                                    >
                                        Edit Task
                                    </Button>
                                    {contextHolder}
                                    <Popconfirm
                                        title={`Delete ${task.taskID}`}
                                        description="Are you sure you want to delete this task?"
                                        onConfirm={handleDeleteTask}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button danger>Delete Task</Button>
                                    </Popconfirm>
                                </div>
                                <Content>
                                    {editingTask ? (
                                        <>
                                            <Input
                                                className="edit-task-title"
                                                onChange={event => setUpdatedTask({...updatedTask, title: event.target.value})}
                                                value={updatedTask.title}
                                            />
                                            <CKEditor
                                                data={task.description}
                                                editor={ClassicEditor}
                                                onChange={(event, editor) => {
                                                    const data = editor.getData();
                                                    setUpdatedTask({...updatedTask, description: data});
                                                }}
                                            />
                                            <div className="task-action-buttons update-task">
                                                <Button
                                                    onClick={() => setEditingTask(false)}
                                                    type="default"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    htmlType="submit"
                                                    onClick={submitUpdateTask}
                                                    type="primary"
                                                >
                                                    Submit Changes
                                                </Button>
                                            </div>
                                        </>
                                    ) : 
                                        <>
                                            <h1>{task.title}</h1>
                                            <div dangerouslySetInnerHTML={{__html: task.description}} />
                                        </>
                                    }
                                    {showLinkTasks && (
                                        <LinkTasks
                                            taskID={taskID}
                                            tasksByProject={tasksByProject}
                                            setVisible={setShowLinkTasks}
                                            setTask={setTask}
                                        />
                                    )}
                                    {task.linkedTasks.length > 0 && (
                                        <div id="related-tasks-section">
                                            <Divider orientation="left">Related Tasks</Divider>
                                            {task.linkedTasks.map(linkedTask => (
                                                <div key={linkedTask.taskID} className="related-task">
                                                    <NavLink
                                                        to={`/task/${linkedTask.taskID}`}
                                                        className="linked-task"
                                                    >
                                                        {linkedTask.taskID}: {linkedTask.title}
                                                    </NavLink>
                                                    <StatusTag
                                                        project={linkedTask.project}
                                                        status={linkedTask.status}
                                                        taskID={linkedTask.taskID}
                                                    />
                                                </div>

                                            ))}
                                        </div>
                                    )}
                                </Content>
                            </div>
                            <AddComment
                                setTask={setTask}
                                task={task}
                            />
                            {
                                task.comments &&
                                task.comments.length > 0 &&
                                <CommentsDisplay
                                    comments={task.comments}
                                    task={task}
                                    setTask={setTask}
                                />
                            }
                        </div>
                        <AdditionalDetails
                            taskDetails={omit(task, 'title', 'description', 'comments')}
                            showHeader
                            width={470}
                        />
                    </Layout>
                </div>
            ) 
            : errors ? (
                <>
                <div id="errors">
                    <ErrorPage />
                </div>
                </>
            ) : <Spin tip="Loading" size="large" />
            }
            
        </>
    );
};

export default TaskPage;