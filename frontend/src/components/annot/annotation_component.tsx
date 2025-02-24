import React, { useState, useEffect } from "react";
import { Card, Col, Row, Divider } from "antd";
import Question from "./components/Question";
import Task from "./components/Task";
import Feedback from "./components/Feedback";
import "./annotation_component.css";
interface TaskData {
  task_id: number; // Change from string to number
  task: string;
}

interface QuestionData {
  _id: string;
  category: string;
  question: string;
  question_id: number;
  retrieval_tasks: TaskData[];
}

interface AnnotationComponentProps {
  question: QuestionData;
}

const AnnotationComponent: React.FC<AnnotationComponentProps> = ({
  question,
}) => {
  const [questionFeedback, setQuestionFeedback] = useState<
    "like" | "dislike" | null
  >(null);

  // Initialize taskValidity with all tasks set to true
  const [taskValidity, setTaskValidity] = useState<Record<number, boolean>>(
    () => {
      return question.retrieval_tasks.reduce((acc, task) => {
        acc[task.task_id] = true;
        return acc;
      }, {} as Record<number, boolean>);
    }
  );

  // Reset state when question changes
  useEffect(() => {
    setQuestionFeedback(null);
    const newTaskValidity: Record<number, boolean> = {};
    question.retrieval_tasks.forEach((task) => {
      newTaskValidity[task.task_id] = true;
    });
    setTaskValidity(newTaskValidity);
  }, [question]);

  if (!question) {
    return <div>Loading...</div>;
  }

  const toggleValidity = (taskId: number) => {
    // Change parameter type
    setTaskValidity((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  return (
    <Card className="annotation-card">
      <Row className="main-content">
        <Col span={18} className="content-column">
          <Question
            question={question.question}
            questionFeedback={questionFeedback}
            setQuestionFeedback={setQuestionFeedback}
          />

          <Divider className="divider" />

          <Col span={24} className="tasks-section">
            {question.retrieval_tasks.map((task) => (
              <Task
                key={`${question._id}-${task.task_id}`} // Unique key
                id={task.task_id}
                task={task.task}
                isValid={taskValidity[task.task_id]}
                onToggle={() => toggleValidity(task.task_id)}
              />
            ))}
            <div style={{ padding: "10px 0" }} />
            <Divider className="divider" />
            <div style={{ padding: "10px 0" }} />
            <Feedback />
          </Col>
        </Col>

        <Col span={1} className="divider-column"></Col>

        <Col span={5} className="db-info-column">
          DBINFO
        </Col>
      </Row>
    </Card>
  );
};

export default AnnotationComponent;
