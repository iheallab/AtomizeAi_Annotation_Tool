// import React, { useEffect } from "react";
// import { DownOutlined } from "@ant-design/icons";
// import { Tree, Switch } from "antd";
// import type { TreeDataNode, TreeProps } from "antd";

// interface TaskVars {
//   valid: boolean;
//   variable: string;
// }

// interface TaskProps {
//   id: number;
//   task: string;
//   table: string;
//   variables: TaskVars[];
//   variableValidity: boolean[][][];
//   setVariableValidity: React.Dispatch<React.SetStateAction<boolean[][][]>>;
//   questionIndex: number;
//   taskIndex: number;
//   questionValid: boolean | null;
// }

// const TaskTree: React.FC<TaskProps> = ({
//   id,
//   task,
//   variableValidity,
//   setVariableValidity,
//   variables,
//   questionIndex,
//   taskIndex,
//   questionValid,
//   // on`Toggle`,
// }) => {
//   // Handle switch toggle for each variable
//   const handleVariableToggle = (variableIndex: number) => {
//     setVariableValidity((prev) => {
//       const newValidity = prev.map((q, qIndex) =>
//         qIndex === questionIndex
//           ? q.map((t, tIndex) =>
//               tIndex === taskIndex
//                 ? t.map((v, vIndex) => (vIndex === variableIndex ? !v : v))
//                 : t
//             )
//           : q
//       );
//       return newValidity;
//     });
//   };

//   useEffect(() => {
//     if (questionValid != null && !questionValid) {
//       setVariableValidity((prev) => {
//         const newValidity = prev.map((q, qIndex) =>
//           qIndex === questionIndex
//             ? q.map((t, tIndex) =>
//                 tIndex === taskIndex
//                   ? t.map(() => false) // ❌ Turn all switches off
//                   : t
//               )
//             : q
//         );
//         return newValidity;
//       });
//     } else {
//       setVariableValidity((prev) => {
//         const newValidity = prev.map((q, qIndex) =>
//           qIndex === questionIndex
//             ? q.map((t, tIndex) =>
//                 tIndex === taskIndex
//                   ? t.map(() => true) // ✅ Turn all switches on
//                   : t
//               )
//             : q
//         );
//         return newValidity;
//       });
//     }
//   }, [questionValid, questionIndex, taskIndex, setVariableValidity]);

//   // Convert the single task into a tree data format with switches
//   const treeData: TreeDataNode[] = [
//     {
//       title: task,
//       key: `task-${id}`,
//       children: variables.map((variable, variableIndex) => ({
//         title: (
//           <span
//             className={
//               variableValidity[questionIndex]?.[taskIndex]?.[variableIndex]
//                 ? "task-text"
//                 : "task-text invalid"
//             }
//           >
//             <Switch
//               checked={
//                 variableValidity[questionIndex]?.[taskIndex]?.[variableIndex] ??
//                 false
//               }
//               onChange={() => handleVariableToggle(variableIndex)}
//             />
//             {"     "}
//             {variable.variable.replace(/_/g, " ")}
//           </span>
//         ),
//         key: `task-${taskIndex}-var-${variableIndex}`,
//       })),
//     },
//   ];

//   const onSelect: TreeProps["onSelect"] = (selectedKeys, info) => {
//     console.log("Selected:", selectedKeys, info);
//   };

//   return (
//     <Tree
//       className="custom-tree"
//       showLine
//       // height={350}
//       switcherIcon={<DownOutlined />}
//       defaultExpandedKeys={[`task-${id}`]} // Expand task node by default
//       onSelect={onSelect}
//       treeData={treeData}
//     />
//   );
// };

// export default TaskTree;
import React, { useEffect } from "react";
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
  table: string;
  variables: TaskVars[];
  variableValidity: boolean[][][];
  setVariableValidity: React.Dispatch<React.SetStateAction<boolean[][][]>>;
  questionIndex: number;
  taskIndex: number;
  questionValid: boolean | null;
}

const TaskTree: React.FC<TaskProps> = ({
  id,
  task,
  variableValidity,
  setVariableValidity,
  variables,
  questionIndex,
  taskIndex,
  questionValid,
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

  // **🔥 Automatically turn off or on all switches based on `questionValid`**
  useEffect(() => {
    if (questionValid !== null) {
      setVariableValidity((prev) => {
        return prev.map((q, qIndex) =>
          qIndex === questionIndex
            ? q.map((t, tIndex) =>
                tIndex === taskIndex
                  ? t.map(() => questionValid) // ✅ Turn on if `questionValid` is true, ❌ turn off if false
                  : t
              )
            : q
        );
      });
    }
  }, [questionValid, questionIndex, taskIndex, setVariableValidity]);

  // Convert task into tree data with variables
  const treeData: TreeDataNode[] = [
    {
      title: task,
      key: `task-${id}`,
      children: variables.map((variable, variableIndex) => ({
        title: (
          <span
            className={
              variableValidity[questionIndex]?.[taskIndex]?.[variableIndex]
                ? "task-text"
                : "task-text invalid"
            }
          >
            <Switch
              checked={
                variableValidity[questionIndex]?.[taskIndex]?.[variableIndex] ??
                false
              }
              onChange={() => handleVariableToggle(variableIndex)}
            />
            {"  "}
            {variable.variable.replace(/_/g, " ")}
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
      className="custom-tree"
      showLine
      switcherIcon={<DownOutlined />}
      defaultExpandedKeys={[`task-${id}`]}
      onSelect={onSelect}
      treeData={treeData}
    />
  );
};

export default TaskTree;
