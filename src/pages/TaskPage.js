import {useState, useEffect, useContext} from "react";
import { useParams } from "react-router-dom";
import { Layout } from "antd";
import { isEmpty } from "lodash";

import { getTask } from "../services/requests";
import AdditionalDetails from "../AdditionalDetails";
import "./TaskPage.css";


const TaskPage = () => {
    const { Content } = Layout;

    const { taskID } = useParams();
    const [task, setTask] = useState({});
    const [showForm, setShowForm] = useState(false);
    
    useEffect(() => {
        getTask(taskID).then(data => {
            setTask(data)
        })
    }, [taskID])

    const changeStatus = status => {
        setTask({...task, status: status})
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
                            showHeader={true}
                            width={470}
                        />
                    </Layout>
                </div>
            ) 
            : ''
            }
            
        </>
    )
}

export default TaskPage;