import React from "react";
import { Input, Row } from "antd";

const { TextArea } = Input;
import "./feedback.css";
// const Feedback: React.FC = () => {
//   return (
//     <Row style={{ margin: "10px", width: "100%" }}>
//       <TextArea
//         rows={4}
//         placeholder="Feedback"
//         maxLength={500}
//         style={{ width: "100%", height: "100%" }}
//       />
//     </Row>
//   );
// };

// export default Feedback;

interface FeedbackProps {
  feedback: string;
  setFeedback: (feedback: string) => void;
}

const Feedback: React.FC<FeedbackProps> = ({ feedback, setFeedback }) => {
  return (
    // <Row style={{ margin: "10px", width: "100%" }}>
    //   <TextArea
    //     rows={4}
    //     placeholder="Enter feedback"
    //     maxLength={500}
    //     style={{ width: "100%", height: "100%" }}
    //     value={feedback}
    //     onChange={(e) => setFeedback(e.target.value)}
    //   />
    // </Row>
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
