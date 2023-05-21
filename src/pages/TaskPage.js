import {useState, useEffect, useContext} from "react";
import { useParams } from "react-router-dom";
import { Layout, Spin, List } from "antd";
import { isEmpty } from "lodash";

import AdditionalDetails from "../components/sidebars/AdditionalDetails";
import LeftSidebar from "../components/sidebars/LeftSidebar";
import Navbar from "../components/Navbar";
import ErrorPage from "./ErrorPage";
import ErrorsContext from "../contexts/ErrorsContext";
import { getTask, getTasksByProject } from "../services/requests";
import "./styles/TaskPage.css";


const TaskPage = () => {
    const { Content, Sider } = Layout;

    const { taskID } = useParams();
    const [task, setTask] = useState({});
    const [tasksByProject, setTasksByProject] = useState([]);
    const [errors, setErrors] = useState(false);
    const { setErrorMessage, setErrorType } = useContext(ErrorsContext);
    
    useEffect(() => {
        getTask(taskID).then(data => {
            setTask(data);
            getTasksByProject(data.project).then(data => {
                setTasksByProject(data);
            })
        }).catch(err => {
            setErrors(true);
            if (err.response.status === 404) {
                setErrorType('Not Found!');
            }
            setErrorMessage(err.response.data);
        })
    }, [taskID]);

    const changeStatus = status => {
        setTask({...task, status: status});
    };

    return  (
        <>
            <Navbar />
            {!isEmpty(task) ? (
                <div id="task-page">
                    {tasksByProject.length > 0 ? <LeftSidebar listItems={tasksByProject} view="Tasks" /> : ''}
                    <Layout>
                        <div id="task-content">
                            <Content>
                                <h1>{task.title}</h1>
                                <p>{task.description}</p>
                            </Content>
                        </div>

                        <AdditionalDetails
                            status={task.status}
                            changeStatus={changeStatus}
                            project={task.project}
                            created={task.created}
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