import { useState, useEffect, useContext } from "react";
import { NavLink, useParams } from "react-router-dom";
import { Descriptions, Image } from "antd";

import Navbar from "../components/Navbar";
import ProfileTasksTable from "../components/profile-tasks-table/ProfileTasksTable";
import UserContext from "../contexts/UserContext";
import ErrorsContext from "../contexts/ErrorsContext";
import ErrorPage from "./ErrorPage";
import { fetchUser } from "../services/requests";
import "./styles/ProfilePage.css";


const ProfilePage = () => {
    const [user, setUser] = useState({});
    const [errors, setErrors] = useState(false);

    const { currentUser } = useContext(UserContext);
    const { errorMessage, setErrorMessage } = useContext(ErrorsContext);
    const { username } = useParams();

    useEffect(() => {
        fetchUser(username).then(data => {
            console.log(data)
            setUser(data);  
        }).catch(err => {
            setErrors(true);
            if (err.response && err.response.status === 404) {
                setErrorMessage(err.response.data);
            }
        })
    }, []);

    return (
        <>
            <Navbar />
            {!errors ? (
                <>
                    <h1>{user.username}</h1>
                    <Descriptions
                        title={`${user.username}'s Details`}
                        bordered
                        layout="vertical"
                        column={4}
                        id="user-details"
                    >
                        <Descriptions.Item label="UserName">{user.username}</Descriptions.Item>
                        <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                        <Descriptions.Item label="Image">
                            <Image src={user.image} width="256" height="312" id="user-image" />
                        </Descriptions.Item>
                        <Descriptions.Item label="Actions">
                            <NavLink to={`/profile/${user.username}/edit`}>Edit Details</NavLink>
                        </Descriptions.Item>
                    </Descriptions>
                    <ProfileTasksTable tasks={user.tasks} />
                </>
            ) : (
                <>
                    <div id="errors">
                        <ErrorPage />
                    </div>
                </>
            )}
        </>
    );
};

export default ProfilePage;