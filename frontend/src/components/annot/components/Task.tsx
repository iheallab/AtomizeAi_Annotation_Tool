// import React from "react";
// import { Row, Col, Switch, Typography } from "antd";

// const { Text } = Typography;

// interface TaskProps {
//   task: string;
//   isValid: boolean;
//   toggleValidity: () => void;
// }

// const Task: React.FC<TaskProps> = ({ task, isValid, toggleValidity }) => {
//   return (
//     <Row justify="space-between" align="middle">
//       <Col span={4}>
//         <Switch
//           checkedChildren="Valid"
//           unCheckedChildren="Invalid"
//           checked={isValid}
//           onChange={() => toggleValidity()} // Ensure it correctly updates only this task
//         />
//       </Col>
//       <Col span={20}>
//         <Text className={isValid ? "task-text" : "task-text invalid"}>
//           {task}
//         </Text>
//       </Col>
//     </Row>
//   );
// };

// export default Task;

import React from "react";
import { Row, Col, Switch, Typography } from "antd";

const { Text } = Typography;

interface TaskProps {
  id: number;
  task: string;
  isValid: boolean;
  onToggle: () => void;
}

const Task: React.FC<TaskProps> = ({ id, task, isValid, onToggle }) => {
  return (
    <div className="task-item">
      <Row justify="space-between" align="middle">
        <Col span={4}>
          <Switch
            checkedChildren="Valid"
            unCheckedChildren="Invalid"
            checked={isValid}
            onChange={onToggle}
          />
        </Col>
        <Col span={20}>
          <Text className={isValid ? "task-text" : "task-text invalid"}>
            {task}
          </Text>
        </Col>
      </Row>
    </div>
  );
};

export default Task;
