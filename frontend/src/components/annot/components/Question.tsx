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
  console.log("Question Validity in Question.tsx", questionValid);
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
              console.log(
                "Updated the new validity",
                updatedValidity[question_idx]
              );
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
