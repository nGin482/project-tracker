import { useState, useEffect } from "react";

import Registration from "../components/registration/Registration";
import Navbar from "../components/Navbar";
import logo from "./../assets/Logo.png";
import "./styles/LoginPage.css";

const LoginPage = props => {
    
    return (
        <>
            <Navbar />
            <div id="login">
                <Registration />
                <img src={logo} alt="Project Tracker Logo" />
            </div>
        </>
    );
};

export default LoginPage;