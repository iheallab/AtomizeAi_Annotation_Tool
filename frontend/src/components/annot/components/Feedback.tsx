import React from "react";
import { Input, Row } from "antd";

const { TextArea } = Input;

const Feedback: React.FC = () => {
  return (
    <Row style={{ margin: "10px", width: "100%" }}>
      <TextArea
        rows={4}
        placeholder="Feedback"
        maxLength={500}
        style={{ width: "100%", height: "100%" }}
      />
    </Row>
  );
};

export default Feedback;
