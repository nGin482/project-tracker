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
import { isEmpty, omit } from "lodash";

import AdditionalDetails from "../components/sidebars/AdditionalDetails";
import LinkTasks from "../components/link-tasks/LinkTasks";
import StatusTag from "../components/status-tag/StatusTag";
import Navbar from "../components/navbar/Navbar";
import ErrorPage from "./ErrorPage";
import ErrorsContext from "../contexts/ErrorsContext";
import UserContext from "../contexts/UserContext";
import useProjects from "../hooks/useProjects";
import { getTask, getTasksByProject, deleteTask } from "../services/requests";
import "./styles/TaskPage.css";


const TaskPage = () => {
    const { Content } = Layout;
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const { taskID } = useParams();
    const { deleteTaskState } = useProjects();
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
    
    // Misc
    const [errors, setErrors] = useState(false);
    
    
    useEffect(() => {
        getTask(taskID).then(data => {
            setTask(data);
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

    const handleDeleteTask = () => {
        deleteTask(task.taskID, user.token).then(data => {
            deleteTaskState(task.project, task.taskID);
            navigate('/');
        }).catch(err => {
            if (err.response.data) {
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
                            <div id="task-action-buttons">
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
                                <h1>{task.title}</h1>
                                <div dangerouslySetInnerHTML={{__html: task.description}} />
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