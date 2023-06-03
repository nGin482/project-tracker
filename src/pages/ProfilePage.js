import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import ProfileTasksTable from "../components/profile-tasks-table/ProfileTasksTable";
import ProfileViewMenu from "./profile-views/ProfileViewMenu";
import ProfileDetails from "./profile-views/ProfileDetails";
import UserContext from "../contexts/UserContext";
import ErrorsContext from "../contexts/ErrorsContext";
import ErrorPage from "./ErrorPage";
import { fetchUser } from "../services/requests";
import "./styles/ProfilePage.css";


const ProfilePage = () => {
    const [user, setUser] = useState({});
    const [errors, setErrors] = useState(false);
    const [menuView, setMenuView] = useState('profile');

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
                    <div id="profile-content">
                        <ProfileViewMenu user={user} setView={setMenuView} />
                        {menuView === 'profile' && <ProfileDetails user={user} />}
                        {menuView === 'tasks' && <ProfileTasksTable tasks={user.tasks} />}
                    </div>
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