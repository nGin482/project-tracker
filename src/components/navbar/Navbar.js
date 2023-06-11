import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { NavLink } from "react-router-dom";
import { Button, Layout, Dropdown } from "antd";
import { LoginOutlined, LogoutOutlined, DownOutlined } from "@ant-design/icons";

import NewTask from "../new-task/NewTask";
import CreateProject from "../create-project/CreateProject";
import UserContext from "../../contexts/UserContext";
import logo from "../../assets/Logo.png";
import "./Navbar.css";


const Navbar = props => {
    const { Header } = Layout;
    const navigate = useNavigate();

    const [showTaskForm, setShowTaskForm] = useState(false);
    const [showProjectForm, setShowProjectForm] = useState(false);
    const { user } = useContext(UserContext);
    const [_, __, removeCookie] = useCookies(['user']);

    const logout = () => {
        removeCookie('user', {path: '/'});
        window.location.reload();
        navigate('/'); 
    }

    const items = [
        {
            label: <NavLink to={`/profile/${user?.username}`}>Profile</NavLink>,
            key: '0',
          },
          {
            label: <NavLink to={`/profile/${user?.username}/edit`}>Edit Details</NavLink>,
            key: '1',
          },
          {
            type: 'divider',
          },
          {
            label: <span onClick={() => logout()}>Logout <LogoutOutlined /></span>,
            key: '3',
          }
    ];

    return (
        <Header className="navbar">
            <img src={logo} alt="Project-Tracker"/>
            <span className="title">
                <NavLink to='/'>Project Tracker</NavLink>
            </span>
            {user && (
                <Button
                    id="create-task-button"
                    className="create-modal-button"
                    onClick={() => setShowTaskForm(true)}
                >
                    Create New Task
                </Button>
                )
            }
            {user && (
                <Button
                    id="create-project-button"
                    className="create-modal-button"
                    onClick={() => setShowProjectForm(true)}
                >
                    Create New Project
                </Button>
                )
            }
            <NewTask showForm={showTaskForm} setShowForm={setShowTaskForm} />
            <CreateProject showForm={showProjectForm} setShowForm={setShowProjectForm} />
            <div id="user-display">
                {user ? (
                    <Dropdown
                        menu={{
                            items,
                        }}
                        trigger={['click']}
                        className="user-dropdown"
                    >
                        <Button id="username">
                            {user.avatar && <img src={user.avatar} id="avatar" width="30" height="240" />}
                            {user.username}<DownOutlined />
                        </Button>
                    </Dropdown>
                ) : (
                    <Button id="login-button">
                        <NavLink to='/login'>
                            <LoginOutlined />Login
                        </NavLink>
                    </Button>
                )}
            </div>

            
        </Header>
    );
};

export default Navbar;