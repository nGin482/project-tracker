import {useState, useEffect, useContext} from "react";
import { Button, Drawer, Input, List, Modal, Pagination } from "antd";

import TaskCard from '../components/task-card/TaskCard';
import ProjectContext from "../contexts/ProjectContext";
import UserContext from "../contexts/UserContext";
import Navbar from "../components/navbar/Navbar";
import useProjects from "../hooks/useProjects";
import { deleteProject } from "../services/requests";


const IndexPage = props => {
    const { projects, projectViewed, setProjectViewed } = useContext(ProjectContext);
    const { user } = useContext(UserContext);
    const { deleteProjectState } = useProjects();

    const [tasksDisplayed, setTasksDisplayed] = useState([]);
    const [showProjects, setShowProjects] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [numPerPage, setNumPerPage] = useState(10);
    const [searchResults, setSearchResults] = useState(projects);
    const [search, setSearch] = useState('');
    const [projectDeletedModal, setProjectDeletedModal] = useState(false);
    const [projectDeletedMessage, setProjectDeletedMessage] = useState('');

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
    // TODO: Note: When projects state updates, this will then re-render all tasks,
    // TODO: regardless of what filter state has been applied

    useEffect(() => {
        if (projectViewed === 'All') {
            let allTasks = [];
            projects.forEach(project => allTasks = allTasks.concat(project.tasks));
            setTasksDisplayed(allTasks);
        }
        else {
            setTasksDisplayed(projectViewed.tasks);
        }
    }, [projectViewed]);

    const handleSearch = event => {
        setSearch(event.target.value);
    };

    const switchProjectViewed = item => {
        setProjectViewed(item);
        setShowProjects(false);
    };

    const handleDeleteProject = project => {
        deleteProject(project, user.token).then(data => {
            setProjectDeletedModal(true);
            setProjectDeletedMessage(data);
            deleteProjectState(project);
        })
        .catch(err => {
            setProjectDeletedModal(true);
            setProjectDeletedMessage(err?.response.data ? err.response.data : err);
        });
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
                <div className="project-controls">
                    <Button onClick={() => setShowProjects(!showProjects)}>Find Project</Button>
                    <Button onClick={() => setProjectViewed('All')}>View all Tasks</Button>
                    {projects.map(project => (
                        <Button
                            onClick={() => handleDeleteProject(project.projectName)}
                            key={`project-${project.projectName}`}
                        >
                            Delete {project.projectName}
                        </Button>
                    ))}
                    <Modal
                        open={projectDeletedModal}
                        onOk={() => setProjectDeletedModal(false)}
                        onCancel={() => setProjectDeletedModal(false)}  
                    >
                        {projectDeletedMessage}
                    </Modal>
                    <Pagination
                        total={tasksDisplayed.length}
                        defaultCurrent={1}
                        onChange={page => setPageNumber(page)}
                        // showSizeChanger
                        // pageSize={numPerPage}
                        // onShowSizeChange={(current, pageSize) => setNumPerPage(pageSize)}
                        className="tasks-pagination"
                    />
                </div>
                {tasksDisplayed
                    .slice((pageNumber - 1) * numPerPage, pageNumber * numPerPage)
                    .map(task => 
                        <TaskCard key={task.taskID} task={task} />
                    )
                }
            </div>
        </>
    );
};

export default IndexPage;