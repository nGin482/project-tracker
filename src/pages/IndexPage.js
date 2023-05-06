import {useState, useEffect, useContext} from "react";
import { Button } from "antd";

import TaskCard from '../components/task-card/TaskCard';
import TasksContext from "../contexts/TasksContext";
import NewTask from "../components/new-task/NewTask";


const IndexPage = () => {
    const [showForm, setShowForm] = useState(false);
    const { tasks } = useContext(TasksContext);


    return  (
        <>
            <h1>Project Tracker</h1>
            <div id="container">
                <Button id="create-task" onClick={() => setShowForm(true)}>Create New Task</Button>
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </div>
            <NewTask showForm={showForm} setShowForm={setShowForm} project="DVD-Library"/>
        </>
    )
}

export default IndexPage;