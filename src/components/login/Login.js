import { Button, Form, Input, message, Space } from "antd";

import useAuth from "../../hooks/useAuth";
import "./Login.css";

const Login = props => {
    const { setFormShown } = props;
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const { loginUser } = useAuth(form, messageApi);

    return (
        <Form
            form={form}
            id="login-form"
            onFinish={loginUser}
        >
            {contextHolder}
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