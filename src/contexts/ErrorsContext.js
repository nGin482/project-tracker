import { createContext } from "react";

const errorMessage = []

const ErrorsContext = createContext({
    errorMessage: errorMessage,
    setErrorMessage: () => {},
    errorType: '',
    setErrorType: () => {}
});

export default ErrorsContext;