import React, { useEffect } from "react";
import { Card, Col, Row, Tag, Tooltip, Splitter, Descriptions } from "antd";
import Question from "./components/Question";
import Task from "./components/Task";
import Feedback from "./components/Feedback";
import "./annotation_component.css";
import Grid from "./components/Grid";
import Reasoning from "./components/Reasoning";
import { QuestionData } from "./types";
import { InfoCircleOutlined } from "@ant-design/icons";

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
  reasoningValid: boolean[];
  setReasoningValid: React.Dispatch<React.SetStateAction<boolean[]>>;
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
}) => {
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

  return (
    <Card
      // title={`Question ${currentQuestionIndex + 1}`}
      variant="borderless"
      className="annotation-card"
    >
      <Row className="main-content">
        <Col span={16} className="content-column">
          <Row className="question-row">
            <Descriptions>
              <Descriptions.Item label="ICU-Type">
                <Tag color="magenta">{question.icu_type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                <Tag color="geekblue">{question.category}</Tag>
              </Descriptions.Item>
            </Descriptions>

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
          <Card hoverable={true} type="inner" className="tasks-card">
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
              questionValid={questionValid[currentQuestionIndex]}
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
            <Reasoning
              reasoning={question.reasoning}
              reasoningValid={reasoningValid[currentQuestionIndex]}
              setReasoningValid={setReasoningValid}
              questionIndex={currentQuestionIndex}
            />
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

export default AnnotationComponent;
