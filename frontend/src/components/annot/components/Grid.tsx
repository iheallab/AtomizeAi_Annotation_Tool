import React from "react";
import { Row, Col } from "antd";

interface GridComponentProps {
  answeredQuestions: boolean[]; // Tracks answered status
  currentQuestionIndex: number; // Tracks current question index
}

const Grid: React.FC<GridComponentProps> = ({
  answeredQuestions,
  currentQuestionIndex,
}) => {
  return (
    <div style={{ padding: 20 }}>
      <Row gutter={[8, 8]} justify="center">
        {answeredQuestions.map((answered, index) => (
          <Col key={index}>
            <div
              style={{
                width: 30,
                height: 30,
                backgroundColor:
                  index == currentQuestionIndex
                    ? "#0096FF"
                    : answered
                    ? "#4caf50"
                    : "#e0e0e0",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: "bold",
                color:
                  index == currentQuestionIndex || answered
                    ? "#ffffff"
                    : "#000000",
                cursor: "pointer",
              }}
            >
              {index + 1}
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Grid;
