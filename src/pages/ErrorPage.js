import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { Alert, Button } from "antd";

import ErrorsContext from "../contexts/ErrorsContext";
import "./styles/ErrorPage.css";


const ErrorPage = props => {
    const errorsContext = useContext(ErrorsContext);
    const { errorMessage } = errorsContext;

    return (
        <>
            <h1>Something went wrong!</h1>
            <Alert type="error" message="Not Found!" description={errorMessage} showIcon />
            <Button size="large">
                <NavLink to="/">Home</NavLink>
            </Button>
        </>
    );
};

export default ErrorPage;