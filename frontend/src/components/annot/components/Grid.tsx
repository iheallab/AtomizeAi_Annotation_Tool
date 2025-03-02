// import React from "react";
// import { Row, Col } from "antd";
// import "./grid.css";
// interface GridComponentProps {
//   answeredQuestions: boolean[];
//   currentQuestionIndex: number;
//   onQuestionSelect: (index: number) => void; // Function to handle click
// }

// const Grid: React.FC<GridComponentProps> = ({
//   answeredQuestions,
//   currentQuestionIndex,
//   onQuestionSelect,
// }) => {
//   // console.log("Answered Questions in Grid", answeredQuestions);
//   return (
//     <div className="grid-container">
//       <Row gutter={[8, 8]} justify="center">
//         {answeredQuestions.map((answered, index) => (
//           <Col key={index}>
//             <div
//               onClick={() => onQuestionSelect(index)}
//               className={`grid-item ${
//                 index === currentQuestionIndex
//                   ? "active"
//                   : answered
//                   ? "answered"
//                   : "default"
//               }`}
//             >
//               {index + 1}
//             </div>
//           </Col>
//         ))}
//       </Row>
//     </div>
//   );
// };

// export default Grid;

import React, { useState } from "react";
import { Row, Col, Drawer, FloatButton } from "antd";
import {
  CaretLeftFilled,
  FileTextOutlined,
  MenuOutlined,
} from "@ant-design/icons";
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
        // type="primary" // Primary color
        // description="Navigation" // Tooltip
        // shape="square" // Square shape
        onClick={() => setOpen(true)} // Opens the Drawer
        style={{ right: 20, bottom: 20 }} // Positioned at bottom-right
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
