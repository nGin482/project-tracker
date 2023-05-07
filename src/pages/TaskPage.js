import {useState, useEffect, useContext} from "react";
import { useParams } from "react-router-dom";
import { Layout, Spin } from "antd";
import { isEmpty } from "lodash";

import AdditionalDetails from "../AdditionalDetails";
import ErrorPage from "./ErrorPage";
import ErrorsContext from "../contexts/ErrorsContext";
import { getTask } from "../services/requests";
import "./styles/TaskPage.css";


const TaskPage = () => {
    const { Content } = Layout;

    const { taskID } = useParams();
    const [task, setTask] = useState({});
    const [errors, setErrors] = useState(false);
    const { setErrorMessage, setErrorType } = useContext(ErrorsContext);
    
    useEffect(() => {
        getTask(taskID).then(data => {
            setTask(data);
        }).catch(err => {
            setErrors(true);
            if (err.response.status === 404) {
                setErrorType('Not Found!')
            }
            setErrorMessage(err.response.data);
        })
    }, [taskID]);

    const changeStatus = status => {
        setTask({...task, status: status});
    }

    return  (
        <>
            {!isEmpty(task) ? (
                <div id="task-page">
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