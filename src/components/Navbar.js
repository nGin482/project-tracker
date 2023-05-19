import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Button, Layout } from "antd";
import { LoginOutlined } from "@ant-design/icons";

import NewTask from "../components/new-task/NewTask";
import logo from "../assets/Logo.png";
import "./Navbar.css";


const Navbar = props => {
    const { Header } = Layout;

    const [showForm, setShowForm] = useState(false);

    return (
        <Header className="navbar">
            <img src={logo} alt="Project-Tracker"/>
            <span className="title">
                <NavLink to='/'>Project Tracker</NavLink>
            </span>
            <Button id="create-task-button" onClick={() => setShowForm(true)}>Create New Task</Button>
            <NewTask showForm={showForm} setShowForm={setShowForm} project="DVD-Library"/>
            <Button id="login-button">
                <NavLink to='/login'>
                    <LoginOutlined />Login
                </NavLink>
            </Button>
        </Header>
    );
};

export default Navbar;