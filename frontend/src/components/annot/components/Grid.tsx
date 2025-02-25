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
  return (
    // <div style={{ padding: 20 }}>
    // <div style={{ padding: 20, width: "100%", overflowX: "auto" }}>
    //   <Row gutter={[8, 8]} justify="center">
    //     {answeredQuestions.map((answered, index) => (
    //       <Col key={index}>
    //         <div
    //           onClick={() => onQuestionSelect(index)} // Handle click
    //           style={{
    //             width: 30,
    //             height: 30,
    //             backgroundColor:
    //               index === currentQuestionIndex
    //                 ? "#0096FF"
    //                 : answered
    //                 ? "#4caf50"
    //                 : "#e0e0e0",
    //             borderRadius: 4,
    //             display: "flex",
    //             alignItems: "center",
    //             justifyContent: "center",
    //             fontSize: 14,
    //             fontWeight: "bold",
    //             color:
    //               index === currentQuestionIndex || answered
    //                 ? "#ffffff"
    //                 : "#000000",
    //             cursor: "pointer",
    //           }}
    //         >
    //           {index + 1}
    //         </div>
    //       </Col>
    //     ))}
    //   </Row>
    // </div>

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
