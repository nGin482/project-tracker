import {useState, useEffect, useContext} from "react";
import { useParams, NavLink } from "react-router-dom";
import { Layout, Spin, Divider, Drawer, Button, List, Input } from "antd";
import { isEmpty, omit } from "lodash";

import AdditionalDetails from "../components/sidebars/AdditionalDetails";
import LinkTasks from "../components/link-tasks/LinkTasks";
import StatusTag from "../components/status-tag/StatusTag";
import Navbar from "../components/navbar/Navbar";
import ErrorPage from "./ErrorPage";
import ErrorsContext from "../contexts/ErrorsContext";
import { getTask, getTasksByProject } from "../services/requests";
import "./styles/TaskPage.css";


const TaskPage = () => {
    const { Content } = Layout;
    const { taskID } = useParams();
    const { setErrorMessage, setErrorType } = useContext(ErrorsContext);

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
                            <Content>
                                <h1>{task.title}</h1>
                                <p>{task.description}</p>
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