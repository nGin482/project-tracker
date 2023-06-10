import { createContext } from "react";

const defaultProjects = []

const ProjectContext = createContext({
    projects: defaultProjects,
    setProjects: () => {},
    projectViewed: {},
    setProjectViewed: () => {}
});

export default ProjectContext;