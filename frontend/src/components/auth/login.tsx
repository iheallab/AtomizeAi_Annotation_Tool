import React, { useContext } from "react";
import { FormProps } from "antd";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input, notification } from "antd";
import { AuthContext } from "../AuthContext";
import { backendURI } from "../commons";
import type { NotificationArgsProps } from "antd";

type UserCreds = {
  username: string;
  password: string;
};

type NotificationPlacement = NotificationArgsProps["placement"];

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [api, contextHolder] = notification.useNotification();

  const openNotification = (placement: NotificationPlacement) => {
    api.error({
      message: `Login Error!`,
      description: "Username or Password is incorrect!",
      placement,
      duration: 2,
    });
  };

  const onFinish = async (values: UserCreds) => {
    try {
      const response = await fetch(backendURI + "login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        openNotification("top");
        throw new Error(errorMessage || "Login failed");
      }

      const data = await response.json();
      console.log("Login successful. Received token:", data.token);

      // Store JWT in localStorage and set AuthContext
      login(data.token);

      navigate("/annotations");
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const onFinishFailed: FormProps<UserCreds>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Form
      name="basic"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 600 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      {contextHolder}
      <Form.Item<UserCreds>
        label="Username"
        name="username"
        rules={[{ required: true, message: "Please input your username!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item<UserCreds>
        label="Password"
        name="password"
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item label={null}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;
