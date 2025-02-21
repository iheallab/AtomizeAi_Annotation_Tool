import React, { useState } from "react";
import { Card, Button, Col, Row } from "antd";
import AnnotationComponent from "./annotation_component";

const questions = Array.from({ length: 100 }, (_, i) => ({
  question_text: `Question ${i + 1}: Sample question text here?`,
  tasks: [
    {
      table: "sample_table",
      task: `Task for question ${i + 1}`,
      sql_query: `SELECT * FROM sample_table WHERE id = ${i + 1}`,
    },
  ],
}));

const Annotations: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState<boolean[]>(
    Array(questions.length).fill(false)
  );

  const markAsDone = () => {
    setCompletedQuestions((prev) => {
      const updated = [...prev];
      updated[currentQuestionIndex] = true;
      return updated;
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "90%",
        margin: "0 auto",
      }}
    >
      <AnnotationComponent
        question={questions[currentQuestionIndex]}
        currentQuestionIndex={currentQuestionIndex}
        setCurrentQuestionIndex={setCurrentQuestionIndex}
        completedQuestions={completedQuestions}
      />

      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <Button
          onClick={() =>
            setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))
          }
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        <Button onClick={markAsDone}>Submit</Button>
        <Button
          onClick={() =>
            setCurrentQuestionIndex((prev) =>
              Math.min(prev + 1, questions.length - 1)
            )
          }
          disabled={currentQuestionIndex === questions.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Annotations;
