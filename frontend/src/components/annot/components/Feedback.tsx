import React from "react";
import { Input, Row, Form } from "antd";

const { TextArea } = Input;
import "./feedback.css";
interface FeedbackProps {
  feedback: string;
  setFeedback: (feedback: string) => void;
  questionValid: boolean | null;
  reasonValid: boolean | null;
}

const Feedback: React.FC<FeedbackProps> = ({
  feedback,
  setFeedback,
  questionValid,
  reasonValid,
}) => {
  // const [api, contextHolder] = notification.useNotification();

  // const openNotification = (pauseOnHover: boolean) => () => {
  //   api.open({
  //     message: "Notification Title",
  //     description:
  //       "This is the content of the notification. This is the content of the notification. This is the content of the notification.",
  //     showProgress: true,
  //     pauseOnHover,
  //   });
  // };
  return (
    <Row className="feedback-container">
      {/* {contextHolder} */}
      <Form.Item
        validateStatus={
          (questionValid === false || reasonValid === false) && !feedback
            ? "error"
            : ""
        }
        help={
          (questionValid === false || reasonValid === false) && !feedback
            ? `Please provide feedback on why ${
                questionValid === false ? "question" : "reasoning"
              } is invalid`
            : ""
        }
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
