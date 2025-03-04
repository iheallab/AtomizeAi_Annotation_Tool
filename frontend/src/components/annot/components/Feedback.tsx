import React from "react";
import { Input, Row, Form } from "antd";

const { TextArea } = Input;
import "./feedback.css";
interface FeedbackProps {
  feedback: string;
  setFeedback: (feedback: string) => void;
  questionValid: boolean;
}

const Feedback: React.FC<FeedbackProps> = ({
  feedback,
  setFeedback,
  questionValid,
}) => {
  return (
    <Row className="feedback-container">
      <Form.Item
        validateStatus={!questionValid && !feedback ? "error" : ""}
        help={!questionValid && !feedback ? "Please provide feedback" : ""}
      >
        <TextArea
          rows={4}
          placeholder="Enter feedback"
          maxLength={500}
          className="feedback-textarea"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </Form.Item>
    </Row>
  );
};

export default Feedback;
