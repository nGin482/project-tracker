import { createContext } from "react";

const defaultTasks = []

const TasksContext = createContext(defaultTasks);

export default TasksContext;