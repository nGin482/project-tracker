import { useState, useEffect } from "react";
import { BugOutlined } from "@ant-design/icons";

import epicIcon from "../../assets/Epic Icon.png";
import investigationIcon from "../../assets/Investigation Icon.png";
import taskIcon from "../../assets/Task Icon.png";
import "./TaskType.css";

const TaskType = props => {
    const { type } = props;
    const [icon, setIcon] = useState(taskIcon);

    useEffect(() => {
        switch(type) {
            case "epic":
                setIcon(epicIcon);
                break;
            case "investigation":
                setIcon(investigationIcon);
                break;
            default:
                setIcon(taskIcon);
        }
    }, []);


    return (
        <>
        {type === 'bug' ? 
            <BugOutlined className="task-icon task-type__bug" width={20} height={20} />
        :
            <img src={icon} alt={type} width={20} height={20} className={`task-icon task-type__${type}`} />
        }
        </>
    );
};

export default TaskType;