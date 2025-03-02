// import React from "react";
// import { Button, Col, Row, Typography, Radio } from "antd";
// import {
//   LikeOutlined,
//   DislikeOutlined,
//   CheckOutlined,
//   CloseOutlined,
// } from "@ant-design/icons";

// const { Title } = Typography;
// import "./question.css";

// interface QuestionProps {
//   question_idx: number;
//   question: string;
//   questionFeedback: "like" | "dislike" | null;
//   // setQuestionFeedback: (feedback: "like" | "dislike" | null) => void;
//   questionValid: boolean;
//   setQuestionValidity: React.Dispatch<React.SetStateAction<boolean[]>>;
// }

// const Question: React.FC<QuestionProps> = ({
//   question_idx,
//   question,
//   questionFeedback,
//   // setQuestionFeedback,
//   questionValid,
//   setQuestionValidity,
// }) => {
//   return (
//     <Row className="question-row">
//       <Col span={18}>
//         <Title className="question-text" level={5}>
//           {question}
//         </Title>
//       </Col>
//       <Col span={6} className="like-dislike-buttons">
//         <Radio.Group
//           value={questionFeedback} // Controlled state
//           onChange={(e) =>
//             setQuestionValidity((prev) => {
//               const updateValidity = [...prev];
//               updateValidity[question_idx] = e.target.value === "like";
//               return updateValidity;
//             })
//           } // Updates state
//           buttonStyle="solid"
//         >
//           {/* Tick Button (Green) */}
//           <Radio.Button
//             value="like"
//             style={{
//               backgroundColor: questionFeedback === "like" ? "#52c41a" : "",
//               color: questionFeedback === "like" ? "white" : "",
//             }}
//           >
//             <CheckOutlined />
//           </Radio.Button>

//           {/* Cross Button (Red) */}
//           <Radio.Button
//             value="dislike"
//             style={{
//               backgroundColor: questionFeedback === "dislike" ? "#ff4d4f" : "",
//               color: questionFeedback === "dislike" ? "white" : "",
//             }}
//           >
//             <CloseOutlined />
//           </Radio.Button>
//         </Radio.Group>
//         {/* <Button
//           icon={<LikeOutlined />}
//           shape="circle"
//           size="middle"
//           className={
//             questionFeedback === "like" ? "selected like-btn" : "like-btn"
//           }
//           onClick={() =>
//             setQuestionFeedback(questionFeedback === "like" ? null : "like")
//           }
//         />
//         <Button
//           icon={<DislikeOutlined />}
//           shape="circle"
//           size="middle"
//           className={
//             questionFeedback === "dislike"
//               ? "selected dislike-btn"
//               : "dislike-btn"
//           }
//           onClick={() =>
//             setQuestionFeedback(
//               questionFeedback === "dislike" ? null : "dislike"
//             )
//           }
//         /> */}
//       </Col>
//     </Row>
//   );
// };

// export default Question;

import React from "react";
import { Col, Row, Typography, Radio } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

const { Title } = Typography;
import "./question.css";

interface QuestionProps {
  question_idx: number;
  question: string;
  questionValid: boolean;
  setQuestionValidity: React.Dispatch<React.SetStateAction<boolean[]>>;
}

const Question: React.FC<QuestionProps> = ({
  question_idx,
  question,
  questionValid,
  setQuestionValidity,
}) => {
  return (
    <Row className="question-row">
      <Col span={18}>
        <Title className="question-text" level={5}>
          {question}
        </Title>
      </Col>
      <Col span={6} className="like-dislike-buttons">
        <Radio.Group
          value={questionValid ? "like" : "dislike"} // Controlled state based on questionValid
          onChange={(e) =>
            setQuestionValidity((prev) => {
              const updatedValidity = [...prev];
              updatedValidity[question_idx] = e.target.value === "like"; // Updates boolean state
              return updatedValidity;
            })
          }
          buttonStyle="solid"
        >
          {/* Tick Button (Green) */}
          <Radio.Button
            value="like"
            style={{
              backgroundColor: questionValid ? "#52c41a" : "",
              color: questionValid ? "white" : "",
            }}
          >
            <CheckOutlined />
          </Radio.Button>

          {/* Cross Button (Red) */}
          <Radio.Button
            value="dislike"
            style={{
              backgroundColor: !questionValid ? "#ff4d4f" : "",
              color: !questionValid ? "white" : "",
            }}
          >
            <CloseOutlined />
          </Radio.Button>
        </Radio.Group>
      </Col>
    </Row>
  );
};

export default Question;
