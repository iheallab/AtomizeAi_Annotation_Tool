import React, { useState, useEffect } from "react";
import { Card, Col, Row, Divider } from "antd";
import Question from "./components/Question";
import Task from "./components/Task";
import Feedback from "./components/Feedback";
import "./annotation_component.css";
import Grid from "./components/Grid";
interface TaskData {
  task_id: number; // Change from string to number
  task: string;
  valid?: boolean;
}

interface QuestionData {
  _id: string;
  category: string;
  question: string;
  question_id: number;
  retrieval_tasks: TaskData[];
  main_feedback?: string;
}

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
  taskValidity: Record<number, Record<number, boolean>>;
  setTaskValidity: React.Dispatch<
    React.SetStateAction<Record<number, Record<number, boolean>>>
  >;
  feedback: Record<string, string>;
  setFeedback: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const AnnotationComponent: React.FC<AnnotationComponentProps> = ({
  question,
  questions_list,
  answeredQuestions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  taskValidity,
  setTaskValidity,
  feedback,
  setFeedback,
}) => {
  console.log("Answered Questions in Annotation Component", answeredQuestions);
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
  useEffect(() => {
    setQuestionFeedback(null);

    setTaskValidity((prev) => ({
      ...prev,
      [question.question_id]: question.retrieval_tasks.reduce((acc, task) => {
        acc[task.task_id] = task.valid ?? true; // Use existing validity if available
        return acc;
      }, {} as Record<number, boolean>),
    }));
  }, [question, setTaskValidity]);

  if (!question) {
    return <div>Loading...</div>;
  }

  const toggleValidity = (taskId: number) => {
    setTaskValidity((prev) => ({
      ...prev,
      [question.question_id]: {
        ...prev[question.question_id],
        [taskId]: !prev[question.question_id][taskId],
      },
    }));
  };

  return (
    <Card
      // title={`Question ${currentQuestionIndex + 1}`}
      variant="borderless"
      className="annotation-card"
      style={{
        height: "75vh",
        display: "flex",
        flexDirection: "column",
        width: "90vw",
        maxWidth: "1080px",
      }}
    >
      <Row className="main-content" style={{ height: "100%" }}>
        {/* LEFT SECTION (Question + Tasks + Feedback) */}
        <Col
          span={18}
          className="content-column"
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          {/* QUESTION ROW */}
          <Row style={{ margin: "5px" }}>
            <Question
              question={question.question}
              questionFeedback={questionFeedback}
              setQuestionFeedback={setQuestionFeedback}
            />
          </Row>

          {/* <Divider className="divider" /> */}

          {/* TASKS SECTION (SCROLLABLE) */}
          <Card
            hoverable={true}
            type="inner"
            style={{
              height: "150px",
              overflow: "hidden",
              backgroundColor: "#fbfbfb",
            }}
          >
            <Row style={{ height: "100%", overflowY: "auto" }}>
              <Col span={24} className="tasks-section">
                {/* {question.retrieval_tasks.map((task) => (
                  <Task
                    key={`${question._id}-${task.task_id}`}
                    id={task.task_id}
                    task={task.task}
                    isValid={taskValidity[task.task_id]}
                    onToggle={() => toggleValidity(task.task_id)}
                  />
                ))} */}
                {question.retrieval_tasks.map((task) => (
                  <Task
                    key={`${question._id}-${task.task_id}`}
                    id={task.task_id}
                    task={task.task}
                    isValid={
                      taskValidity[question.question_id]?.[task.task_id] ??
                      false
                    }
                    onToggle={() => toggleValidity(task.task_id)}
                  />
                ))}
              </Col>
            </Row>
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
        <Col span={5} className="db-info-column">
          <Grid
            answeredQuestions={answeredQuestions}
            currentQuestionIndex={currentQuestionIndex}
            onQuestionSelect={(index: number) => setCurrentQuestionIndex(index)}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default AnnotationComponent;
