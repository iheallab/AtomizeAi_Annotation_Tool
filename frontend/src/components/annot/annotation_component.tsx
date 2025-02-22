import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Col,
  Row,
  Divider,
  Switch,
  Typography,
  Input,
} from "antd";
import { LikeOutlined, DislikeOutlined } from "@ant-design/icons";
import "./annotation_component.css"; // Importing CSS styles

const { Text } = Typography;

interface Task {
  table: string;
  task: string;
  sql_query: string;
}

interface Question {
  question_text: string;
  tasks: Task[];
}

interface AnnotationComponentProps {
  question: Question;
}

const AnnotationComponent: React.FC<AnnotationComponentProps> = ({
  question,
}) => {
  // State for thumbs up/down selection for the question
  const [questionFeedback, setQuestionFeedback] = useState<
    "like" | "dislike" | null
  >(null);

  // State to track validity of each task
  const [taskValidity, setTaskValidity] = useState<Record<number, boolean>>({});

  // Reset state when a new question is loaded
  useEffect(() => {
    setQuestionFeedback(null);
    setTaskValidity({});
  }, [question]);
  const { TextArea } = Input;

  return (
    <Card className="annotation-card">
      <Row className="main-content">
        <Col span={18} className="content-column" style={{ minWidth: "600px" }}>
          <Row className="question-row">
            <Col span={18}>
              <Text className="question-text">{question.question_text}</Text>
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
                  setQuestionFeedback(
                    questionFeedback === "like" ? null : "like"
                  )
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

          <Divider className="divider" />
          <Row>
            <Col span={24} className="tasks-section">
              {question.tasks.map((task, index) => (
                <div key={index} className="task-item">
                  <Row justify="space-between" align="middle">
                    <Col span={4}>
                      <Switch
                        defaultChecked
                        checkedChildren="Valid"
                        unCheckedChildren="Invalid"
                        checked={taskValidity[index] ?? true}
                        onChange={(checked) =>
                          setTaskValidity((prev) => ({
                            ...prev,
                            [index]: checked,
                          }))
                        }
                      />
                    </Col>
                    <Col span={20}>
                      <Text
                        className={
                          taskValidity[index] === false
                            ? "task-text invalid"
                            : "task-text"
                        }
                      >
                        {task.task}
                      </Text>
                    </Col>
                  </Row>
                </div>
              ))}
            </Col>
          </Row>
          <Row style={{ margin: "10px" }}>
            <TextArea rows={4} placeholder="Feedback" maxLength={6} />
          </Row>
        </Col>

        {/* Middle Divider */}
        <Col span={1} className="divider-column"></Col>

        {/* Right Side: DB Info */}
        <Col span={5} className="db-info-column">
          DBINFO
        </Col>
      </Row>
    </Card>
  );
};

export default AnnotationComponent;

// import React, { useState, useEffect } from "react";
// import {
//   Card,
//   Button,
//   Col,
//   Row,
//   Divider,
//   Switch,
//   Typography,
//   Input,
// } from "antd";
// import { LikeOutlined, DislikeOutlined } from "@ant-design/icons";
// import "./annotation_component.css";

// const { Text } = Typography;
// const { TextArea } = Input;

// interface Task {
//   table: string;
//   task: string;
//   sql_query: string;
// }

// interface Question {
//   question_text: string;
//   tasks: Task[];
// }

// interface AnnotationComponentProps {
//   question: Question;
//   currentQuestionIndex: number;
//   setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
//   completedQuestions: boolean[];
// }

// const AnnotationComponent: React.FC<AnnotationComponentProps> = ({
//   question,
//   currentQuestionIndex,
//   setCurrentQuestionIndex,
//   completedQuestions,
// }) => {
//   const [questionFeedback, setQuestionFeedback] = useState<
//     "like" | "dislike" | null
//   >(null);
//   const [taskValidity, setTaskValidity] = useState<Record<number, boolean>>({});

//   useEffect(() => {
//     setQuestionFeedback(null);
//     setTaskValidity({});
//   }, [question]);

//   return (
//     <Card className="annotation-card">
//       <Row className="main-content">
//         {/* Left Side: Question & Tasks */}
//         <Col span={18} className="content-column" style={{ minWidth: "600px" }}>
//           <Row className="question-row">
//             <Col span={18}>
//               <Text className="question-text">{question.question_text}</Text>
//             </Col>
//             <Col span={6} className="like-dislike-buttons">
//               <Button
//                 icon={<LikeOutlined />}
//                 shape="circle"
//                 size="middle"
//                 className={
//                   questionFeedback === "like" ? "selected like-btn" : "like-btn"
//                 }
//                 onClick={() =>
//                   setQuestionFeedback(
//                     questionFeedback === "like" ? null : "like"
//                   )
//                 }
//               />
//               <Button
//                 icon={<DislikeOutlined />}
//                 shape="circle"
//                 size="middle"
//                 className={
//                   questionFeedback === "dislike"
//                     ? "selected dislike-btn"
//                     : "dislike-btn"
//                 }
//                 onClick={() =>
//                   setQuestionFeedback(
//                     questionFeedback === "dislike" ? null : "dislike"
//                   )
//                 }
//               />
//             </Col>
//           </Row>

//           <Divider className="divider" />
//           <Row>
//             <Col span={24} className="tasks-section">
//               {question.tasks.map((task, index) => (
//                 <div key={index} className="task-item">
//                   <Row justify="space-between" align="middle">
//                     <Col span={4}>
//                       <Switch
//                         defaultChecked
//                         checkedChildren="Valid"
//                         unCheckedChildren="Invalid"
//                         checked={taskValidity[index] ?? true}
//                         onChange={(checked) =>
//                           setTaskValidity((prev) => ({
//                             ...prev,
//                             [index]: checked,
//                           }))
//                         }
//                       />
//                     </Col>
//                     <Col span={20}>
//                       <Text
//                         className={
//                           taskValidity[index] === false
//                             ? "task-text invalid"
//                             : "task-text"
//                         }
//                       >
//                         {task.task}
//                       </Text>
//                     </Col>
//                   </Row>
//                 </div>
//               ))}
//             </Col>
//           </Row>
//           <Row style={{ margin: "10px" }}>
//             <TextArea rows={4} placeholder="Feedback" maxLength={6} />
//           </Row>
//         </Col>

//         {/* Right Side: Progress Grid */}
//         <Col span={5} className="progress-grid-column">
//           <Card
//             title="Progress"
//             style={{ maxHeight: "400px", overflowY: "auto" }}
//           >
//             <Row gutter={[5, 5]} justify="center">
//               {completedQuestions.map((done, index) => (
//                 <Col key={index} span={6}>
//                   <div
//                     style={{
//                       width: 25,
//                       height: 25,
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       borderRadius: 4,
//                       fontSize: "12px",
//                       backgroundColor: done
//                         ? "#52c41a" // Green for completed
//                         : index === currentQuestionIndex
//                         ? "#1890ff" // Blue for current
//                         : "#d9d9d9", // Grey for pending
//                       cursor: "pointer",
//                       color: "white",
//                     }}
//                     onClick={() => setCurrentQuestionIndex(index)}
//                   >
//                     {index + 1}
//                   </div>
//                 </Col>
//               ))}
//             </Row>
//           </Card>
//         </Col>
//       </Row>
//     </Card>
//   );
// };

// export default AnnotationComponent;
// import React, { useState, useEffect } from "react";
// import {
//   Card,
//   Row,
//   Col,
//   Divider,
//   Switch,
//   Typography,
//   Input,
//   Button,
// } from "antd";
// import { LikeOutlined, DislikeOutlined } from "@ant-design/icons";
// import "./annotation_component.css";

// const { Text } = Typography;
// const { TextArea } = Input;

// interface Task {
//   task: string;
// }

// interface Question {
//   question: string;
//   retrieval_tasks?: Task[];
// }

// interface AnnotationComponentProps {
//   question: Question;
//   currentQuestionIndex: number;
//   setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
//   completedQuestions: boolean[];
// }

// const AnnotationComponent: React.FC<AnnotationComponentProps> = ({
//   question,
//   currentQuestionIndex,
//   setCurrentQuestionIndex,
//   completedQuestions,
// }) => {
//   console.log("Received question prop:", question);

//   if (!question || !question.retrieval_tasks) {
//     console.log("❌ `retrieval_tasks` is missing:", question);
//     return <div>Loading question...</div>;
//   }

//   console.log("✅ Rendering question:", question);
//   console.log("🔍 Tasks inside question:", question.retrieval_tasks);

//   return (
//     <Card className="annotation-card">
//       <Row className="main-content">
//         <Col span={18} className="content-column">
//           <Row className="question-row">
//             <Col span={18}>
//               <Text className="question-text">{question.question}</Text>
//             </Col>
//           </Row>

//           <Divider className="divider" />
//           <Row>
//             <Col span={24} className="tasks-section">
//               {question.retrieval_tasks.map((task, index) => (
//                 <div key={index} className="task-item">
//                   <Row justify="space-between" align="middle">
//                     <Col span={4}>
//                       <Switch
//                         checkedChildren="Valid"
//                         unCheckedChildren="Invalid"
//                       />
//                     </Col>
//                     <Col span={20}>
//                       <Text className="task-text">{task.task}</Text>
//                     </Col>
//                   </Row>
//                 </div>
//               ))}
//             </Col>
//           </Row>
//         </Col>
//       </Row>
//     </Card>
//   );
// };

// export default AnnotationComponent;

// // import React, { useState, useEffect } from "react";
// // import {
// //   Card,
// //   Row,
// //   Col,
// //   Divider,
// //   Switch,
// //   Typography,
// //   Input,
// //   Button,
// // } from "antd";
// // import { LikeOutlined, DislikeOutlined } from "@ant-design/icons";
// // import "./annotation_component.css"; // Make sure this CSS file is correctly linked

// // const { Text } = Typography;
// // const { TextArea } = Input;

// // interface Task {
// //   task: string;
// // }

// // interface Question {
// //   question: string;
// //   retrieval_tasks?: Task[];
// // }

// // interface AnnotationComponentProps {
// //   question: Question;
// //   currentQuestionIndex: number;
// //   setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
// //   completedQuestions: boolean[];
// // }

// // const AnnotationComponent: React.FC<AnnotationComponentProps> = ({
// //   question,
// //   currentQuestionIndex,
// //   setCurrentQuestionIndex,
// //   completedQuestions,
// // }) => {
// //   console.log("✅ Rendering question:", question);

// //   if (!question || !question.retrieval_tasks) {
// //     console.log("❌ `retrieval_tasks` is missing:", question);
// //     return <div>Loading question...</div>;
// //   }

// //   return (
// //     <div className="annotation-container">
// //       <Card className="annotation-card">
// //         <Row className="main-content">
// //           {/* Left Side: Question & Tasks */}
// //           <Col span={18} className="content-column">
// //             <Row className="question-row">
// //               <Col span={18}>
// //                 <Text className="question-text">{question.question}</Text>
// //               </Col>
// //             </Row>

// //             <Divider className="divider" />

// //             {/* Tasks Section */}
// //             <Row>
// //               <Col span={24} className="tasks-section">
// //                 {question.retrieval_tasks.map((task, index) => (
// //                   <div key={index} className="task-item">
// //                     <Row justify="space-between" align="middle">
// //                       <Col span={4} className="switch-container">
// //                         <Switch
// //                           checkedChildren="Valid"
// //                           unCheckedChildren="Invalid"
// //                           className="switch-style"
// //                         />
// //                       </Col>
// //                       <Col span={20} className="task-text-container">
// //                         <Text className="task-text">{task.task}</Text>
// //                       </Col>
// //                     </Row>
// //                   </div>
// //                 ))}
// //               </Col>
// //             </Row>

// //             {/* Feedback Box */}
// //             <Row className="feedback-container">
// //               <TextArea rows={4} placeholder="Provide feedback here..." />
// //             </Row>
// //           </Col>

// //           {/* Right Side: Progress Grid */}
// //           <Col span={5} className="progress-grid-column">
// //             <Card
// //               title="Progress"
// //               className="progress-card"
// //               style={{ maxHeight: "400px", overflowY: "auto" }}
// //             >
// //               <Row gutter={[5, 5]} justify="center">
// //                 {completedQuestions.map((done, index) => (
// //                   <Col key={index} span={6}>
// //                     <div
// //                       className={`progress-item ${
// //                         done
// //                           ? "completed"
// //                           : index === currentQuestionIndex
// //                           ? "current"
// //                           : "pending"
// //                       }`}
// //                       onClick={() => setCurrentQuestionIndex(index)}
// //                     >
// //                       {index + 1}
// //                     </div>
// //                   </Col>
// //                 ))}
// //               </Row>
// //             </Card>
// //           </Col>
// //         </Row>
// //       </Card>
// //     </div>
// //   );
// // };

// // export default AnnotationComponent;
