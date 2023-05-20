import { useState, useEffect } from "react";

import Registration from "../components/registration/Registration";
import Login from "../components/login/Login";
import Navbar from "../components/Navbar";
import logo from "./../assets/Logo.png";
import "./styles/LoginPage.css";

const LoginPage = props => {
    const [formShown, setFormShown] = useState('login');
    
    return (
        <>
            <Navbar />
            <div id="login">
                {formShown === 'login' ? <Login setFormShown={setFormShown} /> : <Registration setFormShown={setFormShown} />}
                <img src={logo} alt="Project Tracker Logo" />
            </div>
        </>
    );
};

export default LoginPage;