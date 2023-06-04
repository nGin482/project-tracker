import {useState, useEffect, useContext} from "react";

import TaskCard from '../components/task-card/TaskCard';
import TasksContext from "../contexts/TasksContext";
import Navbar from "../components/navbar/Navbar";


const IndexPage = () => {
    const { tasks } = useContext(TasksContext);


    return  (
        <>
            <Navbar />
            <div id="container">
                {tasks.map(task => (
                    <TaskCard key={task.taskID} task={task} />
                ))}
            </div>
        </>
    );
};

export default IndexPage;