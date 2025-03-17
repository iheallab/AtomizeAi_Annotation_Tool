import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  GetRef,
  Row,
  Switch,
  Tour,
  TourProps,
  Space,
} from "antd";
import Question from "./components/Question";
import Task from "./components/Task";
import Feedback from "./components/Feedback";
import "./annotation_component.css";
import Grid from "./components/Grid";
import Reasoning from "./components/Reasoning";
import { QuestionData } from "./types";
import { DislikeOutlined, LikeOutlined } from "@ant-design/icons";

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
  questionValid: (boolean | null)[];
  setQuestionValidity: React.Dispatch<React.SetStateAction<(boolean | null)[]>>;
  reasoningValid: (boolean | null)[];
  setReasoningValid: React.Dispatch<React.SetStateAction<(boolean | null)[]>>;
  tasksComplete: boolean[];
  setTasksComplete: React.Dispatch<React.SetStateAction<boolean[]>>;
  openTour: boolean;
  setOpenTour: React.Dispatch<React.SetStateAction<boolean>>;
}

const AnnotationComponent: React.FC<AnnotationComponentProps> = ({
  question,
  answeredQuestions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  variableValidity,
  setVariableValidity,
  feedback,
  setFeedback,
  questionValid,
  setQuestionValidity,
  reasoningValid,
  setReasoningValid,
  tasksComplete,
  setTasksComplete,
  openTour,
  setOpenTour,
}) => {
  if (!question) {
    return <div>Loading...</div>;
  }
  const tasksRef = useRef<GetRef<typeof Card>>(null);
  const feedbackRef = useRef<GetRef<typeof Row>>(null);
  const questionRef = useRef<GetRef<typeof Row>>(null);
  // const navigationRef = useRef<GetRef<typeof Row>>(null);

  // const [openTour, setOpenTour] = useState<boolean>(false);

  const steps: TourProps["steps"] = [
    {
      title: "Is the Question Valid?",
      description:
        "I would ask this question when caring for a patient in the given context in an ICU setting",
      target: () => questionRef.current!,
    },
    {
      title: "Is the data good?",
      description:
        "To answer this question, I would find the following data in the EHR system : ",
      target: () => tasksRef.current!,
    },
    {
      title: "Anything wrong or invalid?",
      description: "Please give the feedback here!",
      target: () => feedbackRef.current!,
    },
    // {
    //   title: "Navigate!",
    //   description: "Click to Navigate to Different Questions",
    //   target: () => navigationRef.current!,
    // },
  ];

  useEffect(() => {
    setVariableValidity((prev) => {
      const newValidity = [...prev];
      newValidity[currentQuestionIndex] = question.retrieval_tasks.map((task) =>
        task.variables.map((variable) => variable.valid)
      );
      return newValidity;
    });
  }, [question, setVariableValidity]);

  return (
    <Card
      // title={`Question ${currentQuestionIndex + 1}`}
      variant="borderless"
      className="annotation-card"
    >
      <Tour
        open={openTour}
        onClose={() => setOpenTour(false)}
        steps={steps}
        indicatorsRender={(current, total) => (
          <span>
            {current + 1} / {total}
          </span>
        )}
      />
      <Row className="main-content">
        <Col span={14} className="column-content">
          <Row className="question-row" ref={questionRef}>
            <Question
              question_idx={currentQuestionIndex}
              question={question.question}
              questionValid={questionValid[currentQuestionIndex]}
              setQuestionValidity={setQuestionValidity}
              icu_type={question.icu_type}
              category={question.category}
              context={question.context}
            />
          </Row>

          {/* <Divider className="divider" /> */}

          {/* TASKS SECTION (SCROLLABLE) */}
          {/* <Card hoverable={true} type="inner" className="tasks-card">
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
                questionValid={questionValid[currentQuestionIndex]}
              />
            ))}
          </Card> */}
          <Card
            ref={tasksRef}
            className="tasks-card"
            // hoverable={true}
            hoverable
          >
            <Row gutter={[16, 16]} className="task-row">
              {question.retrieval_tasks.map((task, index) => (
                <Col xs={24} sm={12} key={`${question._id}-${task.task_id}`}>
                  <Task
                    id={task.task_id}
                    task={task.task}
                    table={task.table}
                    variables={task.variables}
                    variableValidity={variableValidity}
                    setVariableValidity={setVariableValidity}
                    questionIndex={currentQuestionIndex}
                    taskIndex={index}
                    questionValid={questionValid[currentQuestionIndex]}
                  />
                </Col>
              ))}
            </Row>
          </Card>

          {/* <Divider className="divider" /> */}

          {/* FEEDBACK ROW (Fixed Height) */}
          <Row className="feedback-box" ref={feedbackRef}>
            {/* <Feedback /> */}
            <Feedback
              feedback={feedback[question._id] || ""}
              setFeedback={(newFeedback) => {
                setFeedback((prev) => ({
                  ...prev,
                  [question._id]: newFeedback,
                }));
              }}
              questionValid={questionValid[currentQuestionIndex]}
              reasonValid={reasoningValid[currentQuestionIndex]}
            />
          </Row>
        </Col>

        {/* MIDDLE DIVIDER */}
        <Col span={1}>
          <Divider
            type="vertical"
            style={{ height: "100%", borderColor: "rgba(128, 128, 128, 0.5)" }}
          />
        </Col>

        {/* RIGHT SECTION (GRID) */}
        <Col
          span={9}
          style={{
            // justifyContent: "center",
            display: "flex",
            // alignItems: "center",
            flexDirection: "column",
            marginLeft: "10px",
            width: "100%",
          }}
        >
          <Row className="grid-row">
            <Grid
              // ref={navigationRef}
              answeredQuestions={answeredQuestions}
              currentQuestionIndex={currentQuestionIndex}
              onQuestionSelect={(index: number) =>
                setCurrentQuestionIndex(index)
              }
            />
          </Row>
          <Row>
            <Reasoning
              reasoning={question.reasoning}
              reasoningValid={reasoningValid[currentQuestionIndex]}
              setReasoningValid={setReasoningValid}
              questionIndex={currentQuestionIndex}
            />
          </Row>
          <Row>
            {/* Card Below Reasoning with Like/Dislike Buttons */}
            <Card
              className="tasks-card"
              hoverable={true}
              title="Tasks Complete?"
              style={{
                marginTop: "10px",
                padding: "10px",
                height: "175px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between", // Keeps buttons at the bottom
              }}
            >
              <Card.Meta
                description={
                  <div style={{ textAlign: "left" }}>
                    Do the tasks retrieve all relevant data that you would
                    search on an EHR system to answer the question?
                  </div>
                }
              />

              <Row justify="end" style={{ marginRight: "-15px" }}>
                <Space size="middle">
                  <LikeOutlined
                    style={{
                      color:
                        tasksComplete[currentQuestionIndex] === true
                          ? "green"
                          : "gray",
                      fontSize: "18px",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      setTasksComplete((prev) => {
                        const updatedTasks = [...prev];
                        updatedTasks[currentQuestionIndex] = true;
                        return updatedTasks;
                      })
                    }
                  />
                  <DislikeOutlined
                    style={{
                      color:
                        tasksComplete[currentQuestionIndex] === false
                          ? "red"
                          : "gray",
                      fontSize: "18px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setTasksComplete((prev) => {
                        const updatedTasks = [...prev];
                        updatedTasks[currentQuestionIndex] = false;
                        return updatedTasks;
                      });
                      // openNotification(true);
                    }}
                  />
                </Space>
              </Row>
            </Card>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

export default AnnotationComponent;
