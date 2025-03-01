import React from "react";
import { Row, Col } from "antd";
import "./grid.css";
interface GridComponentProps {
  answeredQuestions: boolean[];
  currentQuestionIndex: number;
  onQuestionSelect: (index: number) => void; // Function to handle click
}

const Grid: React.FC<GridComponentProps> = ({
  answeredQuestions,
  currentQuestionIndex,
  onQuestionSelect,
}) => {
  // console.log("Answered Questions in Grid", answeredQuestions);
  return (
    <div className="grid-container">
      <Row gutter={[8, 8]} justify="center">
        {answeredQuestions.map((answered, index) => (
          <Col key={index}>
            <div
              onClick={() => onQuestionSelect(index)}
              className={`grid-item ${
                index === currentQuestionIndex
                  ? "active"
                  : answered
                  ? "answered"
                  : "default"
              }`}
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
