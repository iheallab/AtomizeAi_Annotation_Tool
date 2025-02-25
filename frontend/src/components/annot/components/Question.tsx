import React from "react";
import { Button, Col, Row, Typography } from "antd";
import { LikeOutlined, DislikeOutlined } from "@ant-design/icons";

const { Title } = Typography;

interface QuestionProps {
  question: string;
  questionFeedback: "like" | "dislike" | null;
  setQuestionFeedback: (feedback: "like" | "dislike" | null) => void;
}

const Question: React.FC<QuestionProps> = ({
  question,
  questionFeedback,
  setQuestionFeedback,
}) => {
  return (
    <Row className="question-row">
      <Col span={18}>
        <Title
          level={5}
          className="question-text"
          style={{
            fontFamily: "Arial",
            alignSelf: "left",
            textJustify: "auto",
            fontWeight: "bold",
          }}
        >
          {question}
        </Title>
      </Col>
      <Col span={6} className="like-dislike-buttons">
        <Button
          icon={<LikeOutlined />}
          shape="circle"
          size="middle"
          className={
            questionFeedback === "like" ? "selected like-btn" : "like-btn"
          }
          onClick={() =>
            setQuestionFeedback(questionFeedback === "like" ? null : "like")
          }
        />
        <Button
          icon={<DislikeOutlined />}
          shape="circle"
          size="middle"
          className={
            questionFeedback === "dislike"
              ? "selected dislike-btn"
              : "dislike-btn"
          }
          onClick={() =>
            setQuestionFeedback(
              questionFeedback === "dislike" ? null : "dislike"
            )
          }
        />
      </Col>
    </Row>
  );
};

export default Question;
