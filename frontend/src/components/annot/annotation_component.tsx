import React, { useEffect } from "react";
import { Card, Col, Row, Switch } from "antd";
import Question from "./components/Question";
import Task from "./components/Task";
import Feedback from "./components/Feedback";
import "./annotation_component.css";
import Grid from "./components/Grid";
import Reasoning from "./components/Reasoning";
import { QuestionData } from "./types";

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
        <Col span={14} className="column-content">
          <Row className="question-row">
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
            className="tasks-card"
            hoverable={true}
            // style={{
            //   height: "100%", // Keeps task height fixed
            //   overflow: "hidden", // Prevents content from breaking out
            //   display: "flex",
            //   flexDirection: "column",
            // }}
          >
            <Row gutter={[16, 16]}>
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
          <Row className="feedback-box">
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
        <Col span={1} className="divider-column"></Col>

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
          <Row>
            {/* Card Below Reasoning with Yes/No Switch */}
            <Card
              className="tasks-card"
              hoverable={true}
              title="Tasks Complete?"
              style={{
                marginTop: "10px",
                padding: "10px",
                height: "200px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between", // ✅ Ensures switch stays at the bottom
              }}
            >
              <Card.Meta
                description={
                  <div style={{ textAlign: "left" }}>
                    <b>
                      Do the tasks retrieve all relevant data that you would
                      search on an EHR system to answer the question?
                    </b>
                  </div>
                }
              />

              <Row justify="end">
                <Switch
                  checked={tasksComplete[currentQuestionIndex]}
                  checkedChildren="Yes"
                  unCheckedChildren="No"
                  onChange={(checked) => {
                    console.log("Turning " + checked);
                    setTasksComplete((prev) => {
                      const updatedTasks = [...prev];
                      updatedTasks[currentQuestionIndex] = checked;
                      return updatedTasks;
                    });
                    console.log(
                      "final val : " + tasksComplete[currentQuestionIndex]
                    );
                  }}
                />
              </Row>
            </Card>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

export default AnnotationComponent;
