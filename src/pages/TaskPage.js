import {useState, useEffect, useContext} from "react";
import { useParams, NavLink } from "react-router-dom";
import { Layout, Spin, Drawer, Button, List, Input } from "antd";
import { isEmpty, omit } from "lodash";

import AdditionalDetails from "../components/sidebars/AdditionalDetails";
import Navbar from "../components/Navbar";
import ErrorPage from "./ErrorPage";
import ErrorsContext from "../contexts/ErrorsContext";
import { getTask, getTasksByProject } from "../services/requests";
import "./styles/TaskPage.css";


const TaskPage = () => {
    const { Content } = Layout;
    const { taskID } = useParams();

    const [task, setTask] = useState({});
    const [tasksByProject, setTasksByProject] = useState([]);
    const [showTasksDrawer, setShowTasksDrawer] = useState(false);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [errors, setErrors] = useState(false);
    
    const { setErrorMessage, setErrorType } = useContext(ErrorsContext);
    
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
                                id="tasks-drawer-button"
                            >
                                Show Tasks in this Project
                            </Button>
                            <Content>
                                <h1>{task.title}</h1>
                                <p>{task.description}</p>
                            </Content>
                        </div>
                        <AdditionalDetails
                            taskDetails={omit(task, 'title', 'description', 'taskID', 'comments')}
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