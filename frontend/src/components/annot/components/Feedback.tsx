import React from "react";
import { Input, Row } from "antd";

const { TextArea } = Input;

const Feedback: React.FC = () => {
  return (
    <Row style={{ margin: "10px" }}>
      <TextArea rows={4} placeholder="Feedback" maxLength={500} />
    </Row>
  );
};

export default Feedback;
