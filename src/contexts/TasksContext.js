import { createContext } from "react";

const defaultTasks = []

const TasksContext = createContext({
    tasks: defaultTasks,
    setTasks: () => {}
});

export default TasksContext;