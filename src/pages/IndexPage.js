import { useState } from "react";
import { Button, Drawer, Input, List, Pagination } from "antd";

import TaskCard from '../components/task-card/TaskCard';
import Navbar from "../components/navbar/Navbar";
import CustomDrawer from "../components/custom-drawer/CustomDrawer";
import useIndexPage from "./hooks/useIndexPage";

const IndexPage = props => {
    const [pageNumber, setPageNumber] = useState(1);
    const [numPerPage, setNumPerPage] = useState(10);
    
    const {
        tasksDisplayed,
        showProjects,
        setShowProjects,
        setProjectViewed,
        projects,
        contextHolder,
        switchProjectViewed,
        handleDeleteProject
    } = useIndexPage();

    return  (
        <>
            <Navbar />
            {projects.length > 0 && 
                <CustomDrawer
                    title="Projects"
                    view="projects"
                    open={showProjects}
                    listItems={projects}
                    onClose={setShowProjects}
                    switchProjectViewed={switchProjectViewed}
                />
            }
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
                    {contextHolder}
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