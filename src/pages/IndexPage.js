import {useState, useEffect, useContext} from "react";
import { Button, Drawer, Input, List } from "antd";

import TaskCard from '../components/task-card/TaskCard';
import TasksContext from "../contexts/TasksContext";
import Navbar from "../components/navbar/Navbar";


const IndexPage = props => {
    const { projects } = props;
    const { tasks } = useContext(TasksContext);

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
    }, [projects])

    const handleSearch = event => {
        setSearch(event.target.value);
    };


    return  (
        <>
            <Navbar />
            <Button onClick={() => setShowProjects(!showProjects)}>Find Project</Button>
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
                        <List.Item>
                            <h3>{item.projectCode}: {item.projectName}</h3>
                        </List.Item>
                    )}
                />
            </Drawer>
            <div id="container">
                {tasks.map(task => (
                    <TaskCard key={task.taskID} task={task} />
                ))}
            </div>
        </>
    );
};

export default IndexPage;