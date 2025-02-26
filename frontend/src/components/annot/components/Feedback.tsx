import React from "react";
import { Input, Row } from "antd";

const { TextArea } = Input;
import "./feedback.css";
interface FeedbackProps {
  feedback: string;
  setFeedback: (feedback: string) => void;
}

const Feedback: React.FC<FeedbackProps> = ({ feedback, setFeedback }) => {
  return (
    <Row className="feedback-container">
      <TextArea
        rows={4}
        placeholder="Enter feedback"
        maxLength={500}
        className="feedback-textarea"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />
    </Row>
  );
};

export default Feedback;
