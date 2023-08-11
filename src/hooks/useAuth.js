import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

import UserContext from "../contexts/UserContext";
import { login, register } from "../requests/authRequests";

const useAuth = (form, messageApi) => {
    const [cookie, setCookie, removeCookie] = useCookies(['user']);
    const navigate = useNavigate();

    const { setUser } = useContext(UserContext);

    const createNewUser = () => {
        form.validateFields().then(values => {
            const { username, password, email, image } = values;
            const newUserDetails = { username, password, email, image };
            register(newUserDetails).then(data => {
                navigate(`/profile/${username}`);
                loginUser();
            }).catch(err => {
                const error = err?.response.data ? err.response.data : err;
                messageApi.error(error);
            })
        })
        .catch(err => {
            messageApi.error(err);
        })
    };

    const loginUser = () => {
        form.validateFields().then(values => {
            const { username, password } = values;
            login(username, password).then(data => {
                setUser(data);
                setCookie('user', JSON.stringify(data), {path: '/'})
                form.resetFields();
                navigate(`/profile/${data.username}`)
            }).catch(err => {
                const error = err?.response.data ? err.response.data : err;
                messageApi.error(error);
            })
        }).catch(err => {
            messageApi.error(err);
        })
    };

    const logout = () => {
        removeCookie('user', {path: '/'});
        navigate('/');
        setUser(null);
    };

    return {
        cookie,
        form,
        createNewUser,
        loginUser,
        logout
    };
};

export default useAuth;