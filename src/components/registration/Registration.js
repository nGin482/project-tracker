import { useState, useEffect } from "react";
import { Form, Input, Alert, Button, Space } from "antd";

import { register } from "../../services/requests";
import "./Registration.css";


const Registration = props => {
    const { setFormShown } = props;
    const [form] = Form.useForm();
    const [imageSource, setImageSource] = useState('//ssl.gstatic.com/accounts/ui/avatar_2x.png');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (imageSource === '') {
            setImageSource('//ssl.gstatic.com/accounts/ui/avatar_2x.png');
        }
    }, [imageSource])

    const createNewUser = () => {
        form.validateFields().then(values => {
            console.log(values)
            const { username, password, email, image } = values
            const newUserDetails = { username, password, email, image }
            register(newUserDetails).then(data => {
                console.log(data)
            }).catch(err => {
                setErrorMessage(err.response.data);
            })
        })
        .catch(err => {
            console.log(err)
        })

    }
    const submitFailed = values => {
        setErrorMessage('Username or password was incorrect')
    }


    return (
        <Form
            form={form}
            onFinish={createNewUser}
            onFinishFailed={submitFailed}
            id="registration"
        >
            <img
                src={imageSource}
                alt="profile-img"
                className="profile-img-card"
            />
            {errorMessage !== '' ? <Alert type="error" message={errorMessage} showIcon /> : ''}
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
            <Form.Item
                name="confirm"
                label="Confirm Password"
                dependencies={['password']}
                rules={[
                    {
                        required: true,
                        message: 'Please confirm your password!',
                    },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                        }
                        return Promise.reject(new Error('The two passwords that you entered do not match!'));
                        },
                    }),
                ]}
            >
                <Input.Password />
            </Form.Item>
            <Form.Item
                label="Email"
                name="email"
                rules={[
                    {
                        type: 'email',
                        message: 'The input is not valid E-mail!',
                    },
                    {
                        required: true,
                        message: 'Please input your E-mail!',
                    }
                ]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="URL for Profile Picture"
                name="image"
            >
                <Input onChange={event => setImageSource(event.target.value)}/>
            </Form.Item>
            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    id="registration-submit"
                >
                    Register
                </Button>
            </Form.Item>
            <Space>
               <span>Already have an account?</span>
               <Button type="primary" onClick={() => setFormShown('login')}>Login</Button>
            </Space>
        </Form>
    );
};

export default Registration;