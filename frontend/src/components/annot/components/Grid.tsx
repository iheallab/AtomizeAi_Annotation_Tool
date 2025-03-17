import React, { useState } from "react";
import { Row, Col, Drawer, FloatButton } from "antd";
import { MenuOutlined } from "@ant-design/icons";
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
  const [open, setOpen] = useState(false); // Controls the Drawer visibility

  return (
    <>
      {/* Floating Action Button (FAB) to Toggle Drawer */}
      <FloatButton
        icon={<MenuOutlined />} // Simple icon
        onClick={() => setOpen(true)} // Opens the Drawer
        style={{ right: 10, top: 10 }} // Positioned at bottom-right
      />

      {/* Drawer to Display Grid */}
      <Drawer
        title="Navigation"
        placement="right"
        width={200}
        onClose={() => setOpen(false)}
        open={open}
      >
        <div className="grid-container">
          <Row gutter={[8, 8]} justify="center">
            {answeredQuestions.map((answered, index) => (
              <Col key={index}>
                <div
                  onClick={() => {
                    onQuestionSelect(index);
                    setOpen(false); // Close Drawer when selecting a question
                  }}
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
      </Drawer>
    </>
  );
};

export default Grid;
