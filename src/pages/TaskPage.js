import {useState, useEffect, useContext} from "react";
import { useParams, NavLink, useNavigate } from "react-router-dom";
import {
    Button,
    Divider,
    Drawer,
    Input,
    Layout,
    List,
    message,
    Popconfirm,
    Spin
} from "antd";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { isEmpty, omit } from "lodash";

import AdditionalDetails from "../components/sidebars/AdditionalDetails";
import LinkTasks from "../components/link-tasks/LinkTasks";
import StatusTag from "../components/status-tag/StatusTag";
import Navbar from "../components/navbar/Navbar";
import ErrorPage from "./ErrorPage";
import ErrorsContext from "../contexts/ErrorsContext";
import UserContext from "../contexts/UserContext";
import useProjects from "../hooks/useProjects";
import { getTask, getTasksByProject, updateTask, deleteTask } from "../services/requests";
import "./styles/TaskPage.css";


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
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    
    // Linking Tasks
    const [showLinkTasks, setShowLinkTasks] = useState(false);

    // Edit Task
    const [editingTask, setEditingTask] = useState(false);
    const [updatedTask, setUpdatedTask] = useState({})
    
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
        if (search !== '') {
            setSearchResults(tasksByProject.filter(task => 
                task.title.toLowerCase().includes(search.toLowerCase())
            ));
        }
        else {
            setSearchResults(tasksByProject);
        }
    }, [search]);

    useEffect(() => {
        console.log(task)
    }, [task])

    const handleSearch = event => {
        setSearch(event.target.value);
    };

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
            setTask(data)
        }).catch(err => {
            if (err?.response.data) {
                messageApi.error(err.response.data);
            }
            else {
                messageApi.error(err);
            }
        });
    }

    const handleDeleteTask = () => {
        deleteTask(task.taskID, user.token).then(data => {
            deleteTaskState(task.project, task.taskID);
            navigate('/');
        }).catch(err => {
            if (err?.response.data) {
                messageApi.error(err.response.data);
            }
            else {
                messageApi.error(err);
            }
        });
    };

    return (
        <>
            <Navbar />
            {!isEmpty(task) ? (
                <div id="task-page">
                    {tasksByProject.length > 0 && (
                        <Drawer
                            title={`Tasks in ${task.project}`}
                            placement="left"
                            open={showTasksDrawer}
                            onClose={() => setShowTasksDrawer(!showTasksDrawer)}
                        >
                            <Input placeholder="Search" onChange={handleSearch}/>
                            <List
                                dataSource={searchResults}
                                bordered
                                renderItem={item => (
                                    <List.Item>
                                        <NavLink to={`/task/${item.taskID}`}><h3>{item.title}</h3></NavLink>
                                    </List.Item>
                                )}
                            />
                        </Drawer>
                    )}
                    <Layout>
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
                                                    status={linkedTask.status}
                                                    taskID={linkedTask.taskID}
                                                />
                                            </div>

                                        ))}
                                    </div>
                                )}
                            </Content>
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