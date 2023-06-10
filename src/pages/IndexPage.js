import {useState, useEffect, useContext} from "react";
import { Button, Drawer, Input, List } from "antd";

import TaskCard from '../components/task-card/TaskCard';
import TasksContext from "../contexts/TasksContext";
import ProjectContext from "../contexts/ProjectContext";
import Navbar from "../components/navbar/Navbar";


const IndexPage = props => {
    const { projects, projectViewed, setProjectViewed } = useContext(ProjectContext);

    const [tasksDisplayed, setTasksDisplayed] = useState([]);
    const [showProjects, setShowProjects] = useState(false);
    const [searchResults, setSearchResults] = useState(projects);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (search !== '') {
            setSearchResults(projects.filter(project => 
                project.projectName.toLowerCase().includes(search.toLowerCase())
            ));
        }
        else {
            setSearchResults(projects);
        }
    }, [search]);

    useEffect(() => {
        setSearchResults(projects);
        let allTasks = [];
        projects.forEach(project => allTasks = allTasks.concat(project.tasks));
        setTasksDisplayed(allTasks);
    }, [projects]);

    useEffect(() => {
        if (projectViewed === 'All') {
            let allTasks = [];
            projects.forEach(project => allTasks = allTasks.concat(project.tasks));
            setTasksDisplayed(allTasks);
        }
        else {
            setTasksDisplayed(projectViewed.tasks);
        }
    }, [projectViewed])

    const handleSearch = event => {
        setSearch(event.target.value);
    };

    const switchProjectViewed = item => {
        setProjectViewed(item);
        setShowProjects(false);
    }

    return  (
        <>
            <Navbar />
            <Drawer
                title='Projects'
                placement="left"
                open={showProjects}
                onClose={() => setShowProjects(false)}
            >
                <Input placeholder="Search" onChange={handleSearch}/>
                <List
                    dataSource={searchResults}
                    bordered
                    renderItem={item => (
                        <List.Item onClick={() => switchProjectViewed(item)}>
                            <h3>{item.projectCode}: {item.projectName}</h3>
                        </List.Item>
                    )}
                />
            </Drawer>
            <div id="container">
                <div id="project-controls">
                    <Button onClick={() => setShowProjects(!showProjects)}>Find Project</Button>
                    <Button onClick={() => setProjectViewed('All')}>View all Tasks</Button>
                </div>
                {tasksDisplayed.map(task => (
                    <TaskCard key={task.taskID} task={task} />
                ))}
            </div>
        </>
    );
};

export default IndexPage;