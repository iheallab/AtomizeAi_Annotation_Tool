import React, { useState, useEffect } from "react";
import { Card, Col, Row, Divider, Tag, Tooltip } from "antd";
import Question from "./components/Question";
import Task from "./components/Task";
import Feedback from "./components/Feedback";
import "./annotation_component.css";
import Grid from "./components/Grid";
import Reasoning from "./components/Reasoning";
import { TaskVars, TaskData, QuestionData } from "./types";

// interface AnnotationComponentProps {
//   question: QuestionData;
//   questions_list: QuestionData[];
//   answeredQuestions: boolean[];
//   currentQuestionIndex: number;
//   setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
// }

interface AnnotationComponentProps {
  question: QuestionData;
  questions_list: QuestionData[];
  answeredQuestions: boolean[];
  currentQuestionIndex: number;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  variableValidity: boolean[][][];
  setVariableValidity: React.Dispatch<React.SetStateAction<boolean[][][]>>;
  feedback: Record<string, string>;
  setFeedback: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  questionValid: boolean[];
  setQuestionValidity: React.Dispatch<React.SetStateAction<boolean[]>>;
}

const AnnotationComponent: React.FC<AnnotationComponentProps> = ({
  question,
  questions_list,
  answeredQuestions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  variableValidity,
  setVariableValidity,
  feedback,
  setFeedback,
  questionValid,
  setQuestionValidity,
}) => {
  // console.log("Answered Questions in Annotation Component", answeredQuestions);
  const [questionFeedback, setQuestionFeedback] = useState<
    "like" | "dislike" | null
  >(null);

  // Initialize taskValidity with all tasks set to true
  // const [taskValidity, setTaskValidity] = useState<Record<number, boolean>>(
  //   () => {
  //     return question.retrieval_tasks.reduce((acc, task) => {
  //       acc[task.task_id] = true;
  //       return acc;
  //     }, {} as Record<number, boolean>);
  //   }
  // );

  // Reset state when question changes
  // useEffect(() => {
  //   setQuestionFeedback(null);

  //   setTaskValidity((prev) => ({
  //     ...prev,
  //     [question.question_id]: question.retrieval_tasks.reduce((acc, task) => {
  //       acc[task.task_id] = task.valid ?? true; // Use existing validity if available
  //       return acc;
  //     }, {} as Record<number, boolean>),
  //   }));
  // }, [question, setTaskValidity]);

  if (!question) {
    return <div>Loading...</div>;
  }
  useEffect(() => {
    setVariableValidity((prev) => {
      const newValidity = [...prev];
      newValidity[currentQuestionIndex] = question.retrieval_tasks.map((task) =>
        task.variables.map((variable) => variable.valid)
      );
      return newValidity;
    });
  }, [question, setVariableValidity]);

  // const toggleValidity = (taskId: number) => {
  //   setTaskValidity((prev) => ({
  //     ...prev,
  //     [question.question_id]: {
  //       ...prev[question.question_id],
  //       [taskId]: !prev[question.question_id][taskId],
  //     },
  //   }));
  // };
  const toggleVariableValidity = (taskIndex: number, variableIndex: number) => {
    setVariableValidity((prev) => {
      const newValidity = [...prev];
      newValidity[currentQuestionIndex][taskIndex][variableIndex] =
        !newValidity[currentQuestionIndex][taskIndex][variableIndex];
      return newValidity;
    });
  };

  return (
    <Card
      // title={`Question ${currentQuestionIndex + 1}`}
      variant="borderless"
      className="annotation-card"
      style={{
        height: "90vh",
        display: "flex",
        flexDirection: "column",
        width: "90vw",
        maxWidth: "1080px",
      }}
    >
      <Row className="main-content" style={{ height: "100%" }}>
        {/* LEFT SECTION (Question + Tasks + Feedback) */}
        <Col
          span={16}
          className="content-column"
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          {/* QUESTION ROW */}
          <Row>
            {/* < */}
            <Tooltip title="ICU-Type">
              <Tag color="magenta">{question.icu_type}</Tag>
            </Tooltip>
            <Tooltip title="Category">
              <Tag color="geekblue">{question.category}</Tag>
            </Tooltip>
            <Question
              question_idx={currentQuestionIndex}
              question={question.question}
              // setQuestionFeedback={setQuestionFeedback}
              questionValid={questionValid[currentQuestionIndex]}
              setQuestionValidity={setQuestionValidity}
            />
          </Row>

          {/* <Divider className="divider" /> */}

          {/* TASKS SECTION (SCROLLABLE) */}
          <Card
            hoverable={true}
            type="inner"
            style={{
              height: "300px",
              // overflow: "scroll",
              // backgroundColor: "#fbfbfb",
            }}
          >
            {question.retrieval_tasks.map((task) => (
              <Task
                key={`${question._id}-${task.task_id}`}
                id={task.task_id}
                task={task.task}
                table={task.table}
                variables={task.variables}
                variableValidity={variableValidity}
                setVariableValidity={setVariableValidity}
                questionIndex={currentQuestionIndex}
                taskIndex={question.retrieval_tasks.findIndex(
                  (t) => t.task_id === task.task_id
                )}
              />
            ))}
          </Card>

          {/* <Divider className="divider" /> */}

          {/* FEEDBACK ROW (Fixed Height) */}
          <Row style={{ marginTop: "10px" }}>
            {/* <Feedback /> */}
            <Feedback
              feedback={feedback[question._id] || ""}
              setFeedback={(newFeedback) => {
                setFeedback((prev) => ({
                  ...prev,
                  [question._id]: newFeedback,
                }));
              }}
            />
          </Row>
        </Col>

        {/* MIDDLE DIVIDER */}
        <Col span={1} className="divider-column"></Col>

        {/* RIGHT SECTION (GRID) */}
        <Col span={7} className="db-info-column">
          <Row>
            <Grid
              answeredQuestions={answeredQuestions}
              currentQuestionIndex={currentQuestionIndex}
              onQuestionSelect={(index: number) =>
                setCurrentQuestionIndex(index)
              }
            />
          </Row>
          <Row>
            <Reasoning reasoning={question.reasoning} />
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

export default AnnotationComponent;
