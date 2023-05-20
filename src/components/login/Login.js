import { useState } from "react";
import { Alert, Button, Form, Input, Space } from "antd";

import { login } from "../../services/requests";
import "./Login.css";

const Login = props => {
    const { setFormShown } = props;
    const [form] = Form.useForm();
    const [errorMessage, setErrorMessage] = useState('');

    const loginUser = () => {
        form.validateFields().then(values => {
            const { username, password } = values;
            login(username, password).then(data => {
                setErrorMessage('');
                console.log('redirecting to login page', data)
            }).catch(err => {
                setErrorMessage(err.response.data);
            })
        }).catch(err => {
            setErrorMessage(err);
        })
    }


    return (
        <Form
            form={form}
            id="login-form"
            onFinish={loginUser}
        >
            <Form.Item
                label="Username"
                name="username"
                rules={[
                    {
                        required: true,
                        message: "Please provide your username."
                    }
                ]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Password"
                name="password"
                rules={[
                    {
                        required: true,
                        message: "Please provide your password."
                    }
                ]}
            >
                <Input.Password />
            </Form.Item>
            {errorMessage !== '' ? (
                <Alert 
                    type="error"
                    message={errorMessage}
                    showIcon
                    className="login-alert"
                 /> 
                )
            : ''}
            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    id="login-submit"
                >
                    Login
                </Button>
            </Form.Item>
            <Space>
               <span>Don't have an account?</span>
               <Button type="primary" onClick={() => setFormShown('register')}>Create a new account</Button>
            </Space>
        </Form>
    );
};

export default Login;