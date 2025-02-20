import React, { useContext } from "react";
import type { FormProps } from "antd";
import { useNavigate } from "react-router-dom";
import { Button, Checkbox, Form, Input } from "antd";
import { AuthContext } from "../AuthContext";

type UserCreds = {
  username?: string;
  password?: string;
};

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const onFinish = (values: UserCreds) => {
    console.log("Success:", values);
    // navigate("/annotations");
    try {
      // get token from backend
      const data =
        "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJEaW5vQ2hpZXNhLmdpdGh1Yi5pbyIsInN1YiI6Im1pbmciLCJhdWQiOiJhbG1hIiwiaWF0IjoxNzQwMDIwNzAyLCJleHAiOjE3NDAwMjEzMDJ9.U2h7oQGrjomI55uwEHZS7c6eLOqHj1bLRxTDGF-RS8oiu2isegYEj5FIe-HTvL-bvrLrs_ZCqw2PEFDqh6onx74HM7hu6q5DQGl8kKoozV0q_J99nE4q0N3qTUSJ_yVm0rjuHTAmWi7iKZnhgWDVfLNGmrCQI_Hc_mfxCHUTeTfy3NaMqv8GW_jbPXL7LUf8gsSnjpyDLZo49h85s0utxnCzp_ukIQ9MZU-thSi2_GhD3SdIx_8yeprfzOMVfJEFhDpsY7t4UAxr_zOmLuug1mWF-5ldWzg-N8clf7YA0iP0sA9wmLbHOj34p1qTOksNzmi17cOawx1vTyNRzVVKIQ";
      login(data);
      navigate("/annotations");
    } catch (error) {
      console.error("Error fetching token:", error);
      return;
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
