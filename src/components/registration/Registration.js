import { useEffect } from "react";
import { Button, Form, Input, message, Space, Upload } from "antd";

import useRegister from "./useRegister";
import useAuth from "../../hooks/useAuth";
import "./Registration.css";


const Registration = props => {
    const { setFormShown } = props;
    const [form] = Form.useForm();
    const [messageApi, contextHandler] = message.useMessage();
    const { onChange, uploadFile, useAvatarURL, useImageSource } = useRegister(messageApi);
    const { avatarURL } = useAvatarURL;
    const { imageSource, setImageSource } = useImageSource;
    
    const { createNewUser } = useAuth(form, messageApi);

    useEffect(() => {
        form.setFieldValue('image', avatarURL);
        setImageSource(avatarURL);
    }, [avatarURL, form]);

    const getFile = () => {
        return avatarURL;    
    };

    return (
        <Form
            form={form}
            onFinish={createNewUser}
            id="registration"
        >
            {contextHandler}
            <img
                src={imageSource}
                alt="profile-img"
                className="profile-img-card"
            />
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
                label="Profile Picture"
                name="image"
                getValueFromEvent={getFile}
            >
                <Upload
                    name="avatar"
                    onChange={onChange}
                    customRequest={uploadFile}
                >
                    <Button>Upload Image</Button>
                </Upload>
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