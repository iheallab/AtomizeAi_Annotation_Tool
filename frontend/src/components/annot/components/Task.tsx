// import React from "react";
// import { Row, Col, Switch, Typography } from "antd";

// const { Text } = Typography;
// import "./task.css";

// interface TaskVars {
//   valid: boolean;
//   variable: string;
// }

// interface TaskProps {
//   id: number;
//   task: string;
//   isValid: boolean;
//   variables: TaskVars[];
//   onToggle: () => void;
// }

// const Task: React.FC<TaskProps> = ({
//   id,
//   task,
//   isValid,
//   variables,
//   onToggle,
// }) => {
//   return (
//     <div className="task-item">
//       <Row justify="space-between" align="middle">
//         <Col span={4}>
//           <Switch
//             checkedChildren="Valid"
//             unCheckedChildren="Invalid"
//             checked={isValid}
//             onChange={onToggle}
//           />
//         </Col>
//         <Col span={20}>
//           <Text className={isValid ? "task-text" : "task-text invalid"}>
//             {task}
//           </Text>

//           {/* Move the mapping outside the <Text> component */}
//           {variables.map((variable, index) => (
//             <p key={index}>{variable.variable}</p>
//           ))}
//         </Col>
//       </Row>
//     </div>
//   );
// };

// export default Task;
import React from "react";
import { DownOutlined } from "@ant-design/icons";
import { Tree, Switch } from "antd";
import type { TreeDataNode, TreeProps } from "antd";

interface TaskVars {
  valid: boolean;
  variable: string;
}

interface TaskProps {
  id: number;
  task: string;
  variables: TaskVars[];
  variableValidity: boolean[][][];
  setVariableValidity: React.Dispatch<React.SetStateAction<boolean[][][]>>;
  questionIndex: number;
  taskIndex: number;
}

const TaskTree: React.FC<TaskProps> = ({
  id,
  task,
  variableValidity,
  setVariableValidity,
  variables,
  questionIndex,
  taskIndex,
  // onToggle,
}) => {
  // Handle switch toggle for each variable
  const handleVariableToggle = (variableIndex: number) => {
    setVariableValidity((prev) => {
      const newValidity = prev.map((q, qIndex) =>
        qIndex === questionIndex
          ? q.map((t, tIndex) =>
              tIndex === taskIndex
                ? t.map((v, vIndex) => (vIndex === variableIndex ? !v : v))
                : t
            )
          : q
      );
      return newValidity;
    });
  };

  // Convert the single task into a tree data format with switches
  const treeData: TreeDataNode[] = [
    {
      title: task,
      key: `task-${id}`,
      children: variables.map((variable, variableIndex) => ({
        title: (
          <span>
            <Switch
              checked={
                variableValidity[questionIndex]?.[taskIndex]?.[variableIndex] ??
                false
              }
              onChange={() => handleVariableToggle(variableIndex)}
            />{" "}
            {variable.variable}
          </span>
        ),
        key: `task-${taskIndex}-var-${variableIndex}`,
      })),
    },
  ];

  const onSelect: TreeProps["onSelect"] = (selectedKeys, info) => {
    console.log("Selected:", selectedKeys, info);
  };

  return (
    <Tree
      showLine
      switcherIcon={<DownOutlined />}
      defaultExpandedKeys={[`task-${id}`]} // Expand task node by default
      onSelect={onSelect}
      treeData={treeData}
    />
  );
};

export default TaskTree;
